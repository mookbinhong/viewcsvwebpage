import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';

const UploadComponent: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadMessage, setUploadMessage] = useState<string>('');
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(15); // Number of items to display per page
    const [customItemsPerPage, setCustomItemsPerPage] = useState<string>(''); // Custom number of items per page input
    const [searchTerm, setSearchTerm] = useState<string>(''); // Search term

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('csvFile', file);

            try {
                const response: AxiosResponse<any> = await axios.post('http://localhost:3000/upload', formData, {
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total;
                        if (total !== null && total !== undefined) {
                            const progress = Math.round((progressEvent.loaded / total) * 100);
                            setUploadProgress(progress);
                        }
                    }
                });
                setUploadMessage(response.data.message);
                setJsonData(response.data.data); // Set the JSON data returned from the server
            } catch (error) {
                console.error('Error uploading file:', error);
                setUploadMessage('Error uploading file. Please try again.');
            }
        }
    };

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    // Calculate total number of pages
    const totalPages = Math.ceil(jsonData.length / itemsPerPage);
    // Calculate index of the first and last item to display on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = jsonData.slice(indexOfFirstItem, indexOfLastItem);
    // Apply custom items per page
    const applyCustomItemsPerPage = () => {
        if (!isNaN(parseInt(customItemsPerPage))) {
            setItemsPerPage(parseInt(customItemsPerPage));
            setCurrentPage(1); // Reset to the first page
        }
    };

    // Handle change in custom items per page input
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomItemsPerPage(e.target.value);
    };

    // Handle change in search term
    const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter items based on search term
    const filteredItems = currentItems.filter((item) =>
        Object.values(item).some((value) => String(value).toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );


    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
            {uploadMessage && <p>{uploadMessage}</p>}
            <div>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page Number: {currentPage}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
                <div>
                    {/* <p>Number of items to display </p> */}
                    <input type="text" placeholder="Number of row to display...." value={customItemsPerPage} onChange={handleItemsPerPageChange}/>
                    <button onClick={applyCustomItemsPerPage}>Apply</button>
                </div>
                {/* Search bar */}
          <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchTermChange} />
            </div>
            {currentItems.length > 0 && (
                <table>
                    {/* Table header */}
                    <thead>
                        <tr>
                            {Object.keys(jsonData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    {/* Table body */}
                    <tbody>
                        {filteredItems.map((item, index) => (
                            <tr key={index}>
                                {Object.values(item).map((value, index) => (
                                    <td key={index}>{String(value)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
        </div>
    );
};

export default UploadComponent;
