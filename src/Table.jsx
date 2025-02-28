import './Table.css';
import React, { useState } from 'react';
import { useClientData } from './hooks/useClientData';

const TableRow = ({ client, isExpanded, onToggle }) => {
    return (
        <>
            <tr>
                {/* {console.log(client)} */}
                {console.log("NAME: " + client.firstName + " " + client.lastName)}
                {console.log("BUSINESS NAME: " + client.businessName)}
                {console.log("EMAIL: " + client.email)}
                {console.log("PHONE: " + client.phoneNumber)}
                {console.log("SERVICE: " + client.service)}

                <td>{client.firstName + " " + client.lastName}</td>
                <td>{client.businessName}</td>
                <td>{client.email}</td>
                <td>{client.phoneNumber}</td>
                <td>{client.service}</td>
                <td>
                    <button className="expand-btn" onClick={onToggle}>
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="details-row">
                    <td colSpan="6">
                        <div className="details">
                            <div className="details-column">
                                <strong>Requirements:</strong>
                                <ul>
                                    {client.requirements.map((req, index) => (
                                        <li key={index}>{req.name}: {req.status ? '✅' : '❌'}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="divider"></div>
                            <div className="details-column">
                                <strong>Products:</strong>
                                <ul>
                                    {client.products.map((product, index) => (
                                        <li key={index}>{product}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default function Table() {
    const { clients, loading, error } = useClientData();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const filteredClients = clients.filter(client =>
        Object.values(client).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const toggleDetails = (clientId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clientId)) {
                newSet.delete(clientId);
            } else {
                newSet.add(clientId);
            }
            return newSet;
        });
    };

    return (
        <div className="container">
            <img
                src="https://static.wixstatic.com/media/636f9b_f2871fd983de45dea88cef9593104663~mv2.png/v1/crop/x_28,y_380,w_1426,h_728/fill/w_406,h_208,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/636f9b_f2871fd983de45dea88cef9593104663~mv2.png"
                className="logo"
                alt="Logo"
            />
            <h2>Client Data Table</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for names, services, or requirements..."
            />
            <table>
                <thead>
                    <tr>
                        <th>Client Name</th>
                        <th>Business Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Service Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClients.map(client => (
                        <TableRow
                            key={client.id}
                            client={client}
                            isExpanded={expandedRows.has(client.id)}
                            onToggle={() => toggleDetails(client.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}