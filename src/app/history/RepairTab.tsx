"use client";

import { useState, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const RepairTab = () => {
  interface EventData {
    index: number;
    lampId: string;
    location: string;
    type: string;
    responses_type: string;
    issue: string;
    triggeredTime: string;
  }

  const [data, setData] = useState<EventData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://backend-capstone-production-99e8.up.railway.app/api/responses/combined");
        const jsonData = await response.json();

        const sortedData = jsonData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
        const transformedData = sortedData.map((item: any, index: any) => {
          const issues = ["communication", "komunikasi", "Bola Lampu", "sensor", "lamp"];
          let detectedIssue = "ISSUES";
          
          for (const issue of issues) {
            if (item.body.toLowerCase().includes(issue.toLowerCase())) {
              // Atur `detectedIssue` sesuai dengan kata kunci yang ditemukan
              if (issue.toLowerCase() === "bola lampu" || issue.toLowerCase() === "lamp") {
                detectedIssue = "Bola lampu";
              } else if (issue.toLowerCase() === "sensor") {
                detectedIssue = "Sensor";
              } else if (issue.toLowerCase() === "komunikasi" || issue.toLowerCase() === "communication") {
                detectedIssue = "Komunikasi";
              } else {
                detectedIssue = issue;
              }
              break;
            }
          }
    
          return {
            index: index + 1,
            lampId: `${item.anchor_code || ""}${item.streetlight_code || ""}`.trim(),
            location: item.location && item.location[0] !== undefined && item.location[1] !== undefined
            ? `https://www.google.com/maps?q=${item.location[0]},${item.location[1]}`
            : "Streetlights may have been removed",
            type: item.streetlight_code ? "Nodes" : "Anchor",
            responses_type: item.title.includes("Permasalahan")
              ? "Permasalahan"
              : item.title.includes("Perbaikan")
              ? "Perbaikan"
              : "-",
            issue: detectedIssue,
            triggeredTime: new Date(item.date).toLocaleString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }),
          };
        });
    
        setData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Function to set the color of the notification circle based on status
  const getResponsesColor = (responses_type: any) => {
    switch (responses_type) {
      case "REPAIR":
        return "text-blue-500";
      case "ISSUES":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  // Handlers for pagination
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleDownloadPDF = async (pageWidth = 1100, pageHeight = 800, customColumnWidths = [40, 50, 350, 50, 110, 150, 100]) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
  
    const { height } = page.getSize();
    const fontSize = 10;
    const headerFontSize = 12;
    const margin = 10;
  
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const wrapText = (text: any, maxWidth: any) => {
      const words = text.split(' ');
      let lines = [];
      let currentLine = words[0];
  
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
        if (width < maxWidth) {
          currentLine += ` ${word}`;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Title
    page.drawText('Repair List', {
      x: 50,
      y: height - 40,
      size: headerFontSize + 4,
      font: headerFont,
      color: rgb(0, 0, 0),
    });

    const headers = ['INDEX', 'LAMP ID', 'LOCATION', 'TYPE', 'RESPONSES TYPE', 'ISSUE', 'TRIGGERED TIME'];
    const startY = height - 70;

    // Draw headers with table lines
    headers.forEach((header, index) => {
      const xPosition = 50 + customColumnWidths.slice(0, index).reduce((a, b) => a + b + margin, 0);
      page.drawText(header, {
        x: xPosition,
        y: startY,
        size: headerFontSize,
        font: headerFont,
        color: rgb(0, 0, 0),
      });

      // Draw header cell borders
      page.drawRectangle({
        x: xPosition - margin / 2,
        y: startY - 5,
        width: customColumnWidths[index] + margin,
        height: 20,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0)
      });
    });

    let yPosition = startY - 20;
    data.forEach((event) => {
      const rowData = [
        event.index.toString(),
        event.lampId,
        wrapText(event.location, customColumnWidths[2]),
        event.type,
        event.responses_type,
        event.issue,
        event.triggeredTime,
      ];

      const maxLines = Math.max(...rowData.map(cell => Array.isArray(cell) ? cell.length : 1));
      rowData.forEach((cell, index) => {
        const xPosition = 50 + customColumnWidths.slice(0, index).reduce((a, b) => a + b + margin, 0);
        
        if (Array.isArray(cell)) {
          cell.forEach((line, lineIndex) => {
            page.drawText(line, {
              x: xPosition,
              y: yPosition - (lineIndex * 12),
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          });
        } else {
          page.drawText(cell, {
            x: xPosition,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }

        // Draw cell borders
        page.drawRectangle({
          x: xPosition - margin / 2,
          y: yPosition - (maxLines - 1) * 12 - 5,
          width: customColumnWidths[index] + margin,
          height: maxLines * 15,
          borderWidth: 1,
          borderColor: rgb(0, 0, 0)
        });
      });

      yPosition -= maxLines * 15;

      // Create new page if the current one is full
      if (yPosition < 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = height - 50;
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notifications.pdf';
    link.click();
};  

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="loader mb-4"></div> {/* Spinner */}
            <p className="text-lg font-semibold text-white">Loading...</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-black">Repair List</h2>
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            <button
              className="flex items-center px-4 py-2 text-blue-600 font-semibold hover:underline transition duration-200 ease-in-out"
              onClick={() => handleDownloadPDF()}
            >
              <FontAwesomeIcon icon={faDownload} className="h-5 w-5 mr-4" />
              Download Data
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-blue-600 text-white text-sm">
              <th className="px-2 py-1">INDEX</th>
              <th className="px-2 py-1">LAMP ID</th>
              <th className="px-2 py-1">LOCATION</th>
              <th className="px-2 py-1">TYPE</th>
              <th className="px-2 py-1">RESPONSES TYPE</th>
              <th className="px-2 py-1">ISSUES</th>
              <th className="px-2 py-1">TRIGGERED TIME</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((event, index) => (
              <tr key={index} className={`border-t border-gray-200 text-black text-sm ${index % 2 === 0 ? 'bg-gray-300' : 'bg-white'}`}>
                <td className="px-2 py-2 text-center">{event.index}</td>
                <td className="px-2 py-2 text-center">{event.lampId}</td>
                <td className="px-2 py-2 text-center">
                  <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View Location
                  </a>
                </td>
                <td className="px-2 py-2 text-center">{event.type}</td>
                <td className="px-2 py-2 text-center">{event.responses_type}</td>
                <td className="px-2 py-2 text-center">{event.issue}</td>
                <td className="px-2 py-2 text-center">{event.triggeredTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handlePreviousPage}
            className={`px-4 py-2 border border-gray-300 rounded-l transition-colors duration-200 ${
              currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600'
            }`}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>

          <span className="px-4 py-2 bg-blue-500 text-white font-semibold border border-gray-300">
            {currentPage}
          </span>

          <button
            onClick={handleNextPage}
            className={`px-4 py-2 border border-gray-300 rounded-r transition-colors duration-200 ${
              currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600'
            }`}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
    </div>
  );
};

export default RepairTab;