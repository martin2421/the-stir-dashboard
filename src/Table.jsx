import './Table.css';
import React, { useState } from 'react';
import { useClientData } from './hooks/useClientData';

const TableRow = ({ client, isExpanded, onToggle }) => {

    const parseList = (items) => {
        if (!items) return [];
        if (Array.isArray(items)) return items;
        try {
            // First try JSON parse for JSON string arrays
            return typeof items === 'string' ? JSON.parse(items) : [];
        } catch (error) {
            // If JSON parse fails, try comma-separated string
            return typeof items === 'string' ?
                items.split(',').map(item => item.trim()) :
                [];
        }
    };

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'Not specified';
        // Remove all non-digit characters
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        // Check if the number has 10 digits
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phoneNumber; // Return original if format doesn't match
    };

    const servicesList = parseList(client.services);
    const productsList = parseList(client.products);

    const formatLicenses = (licenses) => {
        if (!licenses) return [];
        try {
            const licenseObj = typeof licenses === 'string' ? JSON.parse(licenses) : licenses;
            return Object.entries(licenseObj).map(([name, hasLicense]) => ({
                name,
                status: hasLicense
            }));
        } catch (error) {
            console.error('Error parsing licenses:', error);
            return [];
        }
    };

    const licensesList = formatLicenses(client.licenses);

    return (
        <>
            <tr>
                <td>{`${client.firstName} ${client.lastName}`}</td>
                <td>{client.businessName}</td>
                <td>{client.email}</td>
                <td>{formatPhoneNumber(client.phoneNumber)}</td>
                <td>
                    <ul className="service-list">
                        {servicesList.map((service, index) => (
                            <li key={index}>{service}</li>
                        ))}
                    </ul>
                </td>
                <td>
                    <button className="expand-btn" onClick={onToggle}>
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="details-row">
                    <td colSpan="6">
                        <div className="details-grid">
                            <div className="details-section">
                                <h4>Business Information</h4>
                                <p><strong>Business Stage:</strong> {client.businessStage}</p>
                                <p><strong>Created At:</strong> {new Date(client.createdAt).toLocaleDateString()}</p>
                                <p><strong>Signed Up:</strong> {new Date(client.signedUp).toLocaleDateString()}</p>
                            </div>

                            {servicesList.includes('Event Venue') ? (
                                <>
                                    <div className="details-section">
                                        <h4>Event Details</h4>
                                        <p><strong>Venue Location:</strong> {
                                            client.eventVenue ?
                                                typeof client.eventVenue === 'string' ?
                                                    JSON.parse(client.eventVenue).venue_location :
                                                    client.eventVenue.venue_location
                                                : 'Not specified'
                                        }</p>
                                        <p><strong>Venue Capacity:</strong> {
                                            client.eventVenue ?
                                                typeof client.eventVenue === 'string' ?
                                                    JSON.parse(client.eventVenue).venue_capacity :
                                                    client.eventVenue.venue_capacity
                                                : 'Not specified'
                                        }</p>
                                        <p><strong>Venue Times:</strong> {client.eventVenueTimes || 'Not specified'}</p>
                                    </div>

                                    <div className="details-section">
                                        <h4>Products & Licenses</h4>
                                        <div className="details-lists">
                                            <div>
                                                <strong>Products:</strong>
                                                <ul>
                                                    {productsList.map((product, index) => (
                                                        <li key={index}>{product}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <strong>Licenses:</strong>
                                                <ul>
                                                    {licensesList.map((license, index) => (
                                                        <li key={index}>
                                                            {license.name}: {license.status ? '✅' : '❌'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="details-section">
                                        <h4>Requirements</h4>
                                        <div className="details-lists">
                                            <div>
                                                <strong>Additional Notes</strong>
                                                <p>{client.notes}</p>
                                            </div>
                                            <div>
                                                <strong>Space Needs:</strong>
                                                <p>{client.spaceNeeds || 'Not specified'}</p>

                                            </div>
                                        </div>
                                    </div>

                                </>)
                                :
                                (<>
                                    <div className="details-section">
                                        <h4>Products & Licenses</h4>
                                        <div className="details-lists">
                                            <div>
                                                <strong>Products:</strong>
                                                <ul>
                                                    {productsList.map((product, index) => (
                                                        <li key={index}>{product}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <strong>Licenses:</strong>
                                                <ul>
                                                    {licensesList.map((license, index) => (
                                                        <li key={index}>
                                                            {license.name}: {license.status ? '✅' : '❌'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="details-section full-width">
                                        <h4>Requirements</h4>
                                        <div className="details-lists">
                                            <div>
                                                <strong>Additional Notes</strong>
                                                <p>{client.notes}</p>
                                            </div>
                                            <div>
                                                <strong>Space Needs:</strong>
                                                <p>{client.spaceNeeds || 'Not specified'}</p>

                                            </div>
                                        </div>
                                    </div></>)}
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

    const filteredClients = clients
        .filter(client => client.id !== -1) // Filter out the special entry
        .filter(client =>
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
                id="searchInput"
                className='search-input'
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