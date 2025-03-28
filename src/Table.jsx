import './Table.css';
import React, { useState } from 'react';
import { useClientData } from './hooks/useClientData';

const TableRow = ({ client, isExpanded, onToggle, onSave, onArchive, isArchived }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState({ ...client });

    const handleEdit = () => {
        if (isEditing) {
            onSave(editedClient);
        }
        setIsEditing(!isEditing);
    };

    const handleArchive = () => {
        if (window.confirm('Are you sure you want to archive this prospect?')) {
            onArchive(client);
        }
    };

    const handleEventVenueChange = (field, value) => {
        setEditedClient(prev => {
            // Parse the current eventVenue or create a new object
            const currentVenue = prev.eventVenue
                ? JSON.parse(prev.eventVenue)
                : { venue_location: '', venue_capacity: '' };

            // Update the specific field
            currentVenue[field] = value;

            // Return updated state with new JSON string
            return {
                ...prev,
                eventVenue: JSON.stringify(currentVenue)
            };
        });
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

                // Don't stringify arrays for services and products
                if (field === 'products' || field === 'services') {
                    // Keep as actual array, not string representation
                    return {
                        ...prev,
                        [field]: processedValue
                    };
                }
            } else if (isLicense) {
                processedValue = JSON.stringify(value);
            } else if ((field === 'createdAt' || field === 'dateSignedUp') && value) {
                // Process date fields
                processedValue = new Date(value).toISOString();
            } else if (field === 'venue_location' || field === 'venue_capacity') {
                try {
                    const eventVenue = prev.eventVenue
                        ? JSON.parse(prev.eventVenue)
                        : { venue_location: '', venue_capacity: '' };
                    eventVenue[field.replace('venue_', '')] = value;
                    processedValue = JSON.stringify(eventVenue);
                } catch (err) {
                    console.error('Error parsing eventVenue:', err);
                    const eventVenue = { venue_location: '', venue_capacity: '' };
                    eventVenue[field.replace('venue_', '')] = value;
                    processedValue = JSON.stringify(eventVenue);
                }
            }

            return {
                ...prev,
                [field]: processedValue,
                eventVenue: field === 'venue_location' || field === 'venue_capacity'
                    ? processedValue
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
                                : typeof editedClient.services === 'string'
                                    ? editedClient.services
                                    : ''}
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
                        {!isEditing && !isArchived && (
                            <button
                                className="archive-btn"
                                onClick={handleArchive}
                                title="Archive this prospect"
                            >
                                Archive
                            </button>
                        )}
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
                                    <strong>Account Created At:</strong>{' '}
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
                                    <strong>Date Signed up as Stir Member:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedClient.dateSignedUp
                                                ? new Date(editedClient.dateSignedUp).toISOString().split('T')[0]
                                                : ''}
                                            onChange={(e) => handleChange('dateSignedUp', e.target.value)}
                                        />
                                    ) : (
                                        client.dateSignedUp
                                            ? new Date(client.dateSignedUp).toLocaleDateString()
                                            : 'Not specified'
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
                                                    value={editedClient.eventVenue
                                                        ? JSON.parse(editedClient.eventVenue).venue_location || ''
                                                        : ''}
                                                    onChange={(e) => handleEventVenueChange('venue_location', e.target.value)}
                                                />
                                            ) : (
                                                client.eventVenue
                                                    ? JSON.parse(client.eventVenue).venue_location || 'Not specified'
                                                    : 'Not specified'
                                            )}
                                        </p>
                                        <p>
                                            <strong>Venue Capacity:</strong>{' '}
                                            {isEditing ? (
                                                <input
                                                    value={editedClient.eventVenue
                                                        ? JSON.parse(editedClient.eventVenue).venue_capacity || ''
                                                        : ''}
                                                    onChange={(e) => handleEventVenueChange('venue_capacity', e.target.value)}
                                                />
                                            ) : (
                                                client.eventVenue
                                                    ? JSON.parse(client.eventVenue).venue_capacity || 'Not specified'
                                                    : 'Not specified'
                                            )}
                                        </p>
                                    </div>

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
                                                                ? editedClient.products.startsWith('[')
                                                                    ? JSON.parse(editedClient.products).join(', ')
                                                                    : editedClient.products
                                                                : ''}
                                                        onChange={(e) => handleChange('products', e.target.value, true)}
                                                        placeholder="Product 1, Product 2, ..."
                                                    />
                                                ) : (
                                                    <ul>
                                                        {(Array.isArray(client.products)
                                                            ? client.products
                                                            : typeof client.products === 'string'
                                                                ? client.products.startsWith('[')
                                                                    ? JSON.parse(client.products)
                                                                    : client.products.split(',').map(p => p.trim())
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
    const { clients, archivedClients, loading, error, updateClient, archiveClient } = useClientData();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showArchived, setShowArchived] = useState(false);
    const [dateRangeStart, setDateRangeStart] = useState('');
    const [dateRangeEnd, setDateRangeEnd] = useState('');

    const handleSaveClient = async (updatedClient) => {
        try {
            await updateClient(updatedClient);
            // alert(`${updatedClient.firstName} ${updatedClient.lastName}'s information has been updated.`);
        } catch (error) {
            alert(`Error archiving client: ${error.message}`);
        }
    };

    const handleArchive = async (client) => {
        try {
            await archiveClient(client);
            alert(`${client.firstName} ${client.lastName} has been archived.`);
        } catch (error) {
            alert(`Error archiving client: ${error.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Choose which dataset to use based on showArchived state
    const dataToDisplay = showArchived ? archivedClients : clients;

    const filteredClients = dataToDisplay
        .filter(client => client.id !== -1) // Filter out the special entry
        .filter(client =>
            Object.values(client).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .filter(client => {
            // If no date range is specified, include all clients
            if (!dateRangeStart && !dateRangeEnd) return true;

            // If client doesn't have a dateSignedUp, only include if not filtering by dates
            if (!client.dateSignedUp) return !dateRangeStart && !dateRangeEnd;

            const clientDate = new Date(client.dateSignedUp);

            // Filter by start date if specified
            if (dateRangeStart && !dateRangeEnd) {
                return clientDate >= new Date(dateRangeStart);
            }

            // Filter by end date if specified
            if (!dateRangeStart && dateRangeEnd) {
                return clientDate <= new Date(dateRangeEnd);
            }

            // Filter by date range if both are specified
            return clientDate >= new Date(dateRangeStart) && clientDate <= new Date(dateRangeEnd);
        });

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

            <button
                className="archive-toggle-btn"
                onClick={() => setShowArchived(!showArchived)}
            >
                {showArchived ? 'View Current' : 'View Archived'}
            </button>

            <h2>{showArchived ? 'Archived Prospects' : 'Prospects Data Table'}</h2>

            <div className="filter-container">
                <div className="search-container">
                    <input
                        type="text"
                        id="searchInput"
                        className='search-input'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for names, services, or requirements..."
                    />
                </div>

                <div className="date-filter">
                    <span>Filter by Stir membership date:</span>

                    <div className="date-filter-labels">
                        <p>Start</p>
                        <p>End</p>
                    </div>


                    <div className="date-inputs">
                        <input
                            type="date"
                            value={dateRangeStart}
                            onChange={(e) => setDateRangeStart(e.target.value)}
                            placeholder="Start date"
                        />
                        {/* <span>to</span> */}
                        <input
                            type="date"
                            value={dateRangeEnd}
                            onChange={(e) => setDateRangeEnd(e.target.value)}
                            placeholder="End date"
                        />
                        {(dateRangeStart || dateRangeEnd) && (
                            <button
                                className="clear-dates-btn"
                                onClick={() => {
                                    setDateRangeStart('');
                                    setDateRangeEnd('');
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <br />

            <div className="results-count">
                {filteredClients.length === 1
                    ? "1 client found"
                    : `${filteredClients.length} ${showArchived ? 'archived' : ''} prospects found`}
                {(searchTerm || dateRangeStart || dateRangeEnd) &&
                    dataToDisplay.filter(client => client.id !== -1).length !== filteredClients.length &&
                    ` (from ${dataToDisplay.filter(client => client.id !== -1).length} total)`}
            </div>

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
                            onArchive={handleArchive}
                            isArchived={showArchived}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}