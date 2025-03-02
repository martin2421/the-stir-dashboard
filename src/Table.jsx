import './Table.css';
import React, { useState } from 'react';
import { useClientData } from './hooks/useClientData';

const TableRow = ({ client, isExpanded, onToggle, onSave }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState({ ...client });

    const handleEdit = () => {
        if (isEditing) {
            onSave(editedClient);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (field, value, isArray = false, isLicense = false) => {
        setEditedClient(prev => {
            let processedValue = value;

            if (isArray) {
                // Handle array fields (services, products)
                if (typeof value === 'string') {
                    processedValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
                } else if (!Array.isArray(value)) {
                    processedValue = [];
                }
            } else if (isLicense) {
                processedValue = JSON.stringify(value);
            } else if (field === 'signedUp') {
                processedValue = Boolean(value); // Ensure boolean value
            } else if (field === 'createdAt' && value) {
                processedValue = new Date(value).toISOString(); // Ensure proper date format
            }

            return {
                ...prev,
                [field]: processedValue,
                // Keep existing eventVenue handling
                eventVenue: field === 'venue_location' || field === 'venue_capacity'
                    ? JSON.stringify({
                        ...JSON.parse(prev.eventVenue || '{"venue_location":"","venue_capacity":""}'),
                        [field.replace('venue_', '')]: value
                    })
                    : prev.eventVenue
            };
        });
    };

    const handleLicenseChange = (licenseName, status) => {
        const currentLicenses = editedClient.licenses
            ? JSON.parse(editedClient.licenses)
            : {};

        setEditedClient(prev => ({
            ...prev,
            licenses: JSON.stringify({
                ...currentLicenses,
                [licenseName]: status
            })
        }));
    };

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
            {/* <tr>
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
            </tr> */}

            <tr>
                <td>
                    {isEditing ? (
                        <div className="edit-field">
                            <input
                                value={editedClient.firstName || ''}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                placeholder="First Name"
                            />
                            <input
                                value={editedClient.lastName || ''}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                placeholder="Last Name"
                            />
                        </div>
                    ) : (
                        `${client.firstName} ${client.lastName}`
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <input
                            value={editedClient.businessName || ''}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                    ) : (
                        client.businessName
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <input
                            value={editedClient.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            type="email"
                        />
                    ) : (
                        client.email
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <input
                            value={editedClient.phoneNumber || ''}
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        />
                    ) : (
                        formatPhoneNumber(client.phoneNumber)
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <input
                            value={Array.isArray(editedClient.services)
                                ? editedClient.services.join(', ')
                                : editedClient.services || ''}
                            onChange={(e) => handleChange('services', e.target.value, true)}
                            placeholder="Service 1, Service 2, ..."
                        />
                    ) : (
                        <ul className="service-list">
                            {servicesList.map((service, index) => (
                                <li key={index}>{service}</li>
                            ))}
                        </ul>
                    )}
                </td>
                <td>
                    <div className="button-group">
                        <button className="expand-btn" onClick={onToggle}>
                            {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                            className={`edit-btn ${isEditing ? 'save-mode' : ''}`}
                            onClick={handleEdit}
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                    </div>
                </td>
            </tr>



            {isExpanded && (
                <tr className="details-row">
                    <td colSpan="6">
                        <div className="details-grid">
                            <div className="details-section">
                                <h4>Business Information</h4>
                                <p>
                                    <strong>Business Stage:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            value={editedClient.businessStage || ''}
                                            onChange={(e) => handleChange('businessStage', e.target.value)}
                                        />
                                    ) : (
                                        client.businessStage
                                    )}
                                </p>
                                <p>
                                    <strong>Created At:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedClient.createdAt
                                                ? new Date(editedClient.createdAt).toISOString().split('T')[0]
                                                : new Date().toISOString().split('T')[0]}
                                            onChange={(e) => handleChange('createdAt', e.target.value)}
                                        />
                                    ) : (
                                        client.createdAt
                                            ? new Date(client.createdAt).toLocaleDateString()
                                            : new Date().toLocaleDateString()
                                    )}
                                </p>
                                <p>
                                    <strong>Signed Up:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            checked={editedClient.signedUp || false}
                                            onChange={(e) => handleChange('signedUp', e.target.checked)}
                                        />
                                    ) : (
                                        client.signedUp ? '✅' : '❌'
                                    )}
                                </p>
                            </div>

                            {servicesList.includes('Event Venue') ? (
                                <>
                                    <div className="details-section">
                                        <h4>Event Details</h4>
                                        <p>
                                            <strong>Venue Location:</strong>{' '}
                                            {isEditing ? (
                                                <input
                                                    value={JSON.parse(editedClient.eventVenue || '{"venue_location":""}').venue_location}
                                                    onChange={(e) => handleChange('venue_location', e.target.value)}
                                                />
                                            ) : (
                                                client.eventVenue ? JSON.parse(client.eventVenue).venue_location : 'Not specified'
                                            )}
                                        </p>
                                        <p>
                                            <strong>Venue Capacity:</strong>{' '}
                                            {isEditing ? (
                                                <input
                                                    value={JSON.parse(editedClient.eventVenue || '{"venue_capacity":""}').venue_capacity}
                                                    onChange={(e) => handleChange('venue_capacity', e.target.value)}
                                                />
                                            ) : (
                                                client.eventVenue ? JSON.parse(client.eventVenue).venue_capacity : 'Not specified'
                                            )}
                                        </p>
                                        <p>
                                            <strong>Venue Times:</strong>{' '}
                                            {isEditing ? (
                                                <input
                                                    value={editedClient.eventVenueTimes || ''}
                                                    onChange={(e) => handleChange('eventVenueTimes', e.target.value)}
                                                />
                                            ) : (
                                                client.eventVenueTimes || 'Not specified'
                                            )}
                                        </p>
                                    </div>
                                    {/* 
                                        </>
                                    ) : null }
                                    */}

                                    <div className="details-section">
                                        <h4>Products & Licenses</h4>
                                        <div className="details-lists">
                                            <div>
                                                <strong>Products:</strong>
                                                {isEditing ? (
                                                    <input
                                                        value={Array.isArray(editedClient.products)
                                                            ? editedClient.products.join(', ')
                                                            : typeof editedClient.products === 'string'
                                                                ? editedClient.products
                                                                : ''}
                                                        onChange={(e) => handleChange('products', e.target.value, true)}
                                                        placeholder="Product 1, Product 2, ..."
                                                    />
                                                ) : (
                                                    <ul>
                                                        {(Array.isArray(client.products)
                                                            ? client.products
                                                            : typeof client.products === 'string'
                                                                ? client.products.split(',').map(p => p.trim())
                                                                : []
                                                        ).map((product, index) => (
                                                            <li key={index}>{product}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div>
                                                <strong>Licenses:</strong>
                                                <ul>
                                                    {licensesList.map((license, index) => (
                                                        <li key={index}>
                                                            {license.name}:{' '}
                                                            {isEditing ? (
                                                                <label className="license-toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={license.status}
                                                                        onChange={(e) => handleLicenseChange(license.name, e.target.checked)}
                                                                    />
                                                                    {license.status ? '✅' : '❌'}
                                                                </label>
                                                            ) : (
                                                                license.status ? '✅' : '❌'
                                                            )}
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
                                                {isEditing ? (
                                                    <textarea
                                                        value={editedClient.notes || ''}
                                                        onChange={(e) => handleChange('notes', e.target.value)}
                                                        rows={4}
                                                    />
                                                ) : (
                                                    <p>{client.notes || 'No additional notes'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <strong>Space Needs:</strong>
                                                {isEditing ? (
                                                    <input
                                                        value={editedClient.spaceNeeds || ''}
                                                        onChange={(e) => handleChange('spaceNeeds', e.target.value)}
                                                    />
                                                ) : (
                                                    <p>{client.spaceNeeds || 'Not specified'}</p>
                                                )}
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
    const { clients, loading, error, updateClient } = useClientData();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const handleSaveClient = async (updatedClient) => {
        try {
            await updateClient(updatedClient);
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

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
                            onSave={handleSaveClient}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}