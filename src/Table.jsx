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
                : { venue_location: '', venue_capacity: '', venue_equipment: '[]' };

            // Update the specific field
            currentVenue[field] = value;

            // Return updated state with new JSON string
            return {
                ...prev,
                eventVenue: JSON.stringify(currentVenue)
            };
        });
    };

    const handleStorageNeedsChange = (field, value) => {
        setEditedClient(prev => {
            // Parse the current storageNeeds or create a new object
            const currentStorage = prev.storageNeeds
                ? JSON.parse(prev.storageNeeds)
                : { dryStorage: '', frozenStorage: '' };

            // Update the specific field
            currentStorage[field] = value;

            // Return updated state with new JSON string
            return {
                ...prev,
                storageNeeds: JSON.stringify(currentStorage)
            };
        });
    };

    const handleChange = (field, value, isLicense = false) => {
        setEditedClient(prev => {
            let processedValue = value;

            if (isLicense) {
                processedValue = JSON.stringify(value);
            } else if ((field === 'createdAt' || field === 'dateSignedUp') && value) {
                // Process date fields
                processedValue = new Date(value).toISOString();
            }

            return {
                ...prev,
                [field]: processedValue
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
    const isEventVenue = client.service === 'Event Venue';
    const isWarehouse = client.service === 'Warehouse';

    return (
        <>
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
                        client.phoneNumber || 'Not specified'
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <input
                            value={editedClient.service || ''}
                            onChange={(e) => handleChange('service', e.target.value)}
                        />
                    ) : (
                        client.service || 'Not specified'
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
                                    <strong>Business Type:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            value={editedClient.businessType || ''}
                                            onChange={(e) => handleChange('businessType', e.target.value)}
                                        />
                                    ) : (
                                        client.businessType || 'Not specified'
                                    )}
                                </p>
                                <p>
                                    <strong>Business Stage:</strong>{' '}
                                    {isEditing ? (
                                        <input
                                            value={editedClient.businessStage || ''}
                                            onChange={(e) => handleChange('businessStage', e.target.value)}
                                        />
                                    ) : (
                                        client.businessStage || 'Not specified'
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
                                        client.createdAt || 'Not specified'
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
                                        client.dateSignedUp || 'Not specified'
                                    )}
                                </p>
                            </div>

                            {isEventVenue && (
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
                                    <p>
                                        <strong>Venue Equipment:</strong>{' '}
                                        {isEditing ? (
                                            <input
                                                value={editedClient.eventVenue
                                                    ? JSON.parse(editedClient.eventVenue).venue_equipment || '[]'
                                                    : '[]'}
                                                onChange={(e) => handleEventVenueChange('venue_equipment', e.target.value)}
                                            />
                                        ) : (
                                            client.eventVenue && JSON.parse(client.eventVenue).venue_equipment
                                                ? JSON.parse(client.eventVenue).venue_equipment
                                                : 'Not specified'
                                        )}
                                    </p>
                                </div>
                            )}

                            {isWarehouse && (
                                <div className="details-section">
                                    <h4>Storage Needs</h4>
                                    <p>
                                        <strong>Dry Storage:</strong>{' '}
                                        {isEditing ? (
                                            <input
                                                value={editedClient.storageNeeds
                                                    ? JSON.parse(editedClient.storageNeeds).dryStorage || ''
                                                    : ''}
                                                onChange={(e) => handleStorageNeedsChange('dryStorage', e.target.value)}
                                            />
                                        ) : (
                                            client.storageNeeds
                                                ? JSON.parse(client.storageNeeds).dryStorage || 'Not specified'
                                                : 'Not specified'
                                        )}
                                    </p>
                                    <p>
                                        <strong>Frozen Storage:</strong>{' '}
                                        {isEditing ? (
                                            <input
                                                value={editedClient.storageNeeds
                                                    ? JSON.parse(editedClient.storageNeeds).frozenStorage || ''
                                                    : ''}
                                                onChange={(e) => handleStorageNeedsChange('frozenStorage', e.target.value)}
                                            />
                                        ) : (
                                            client.storageNeeds
                                                ? JSON.parse(client.storageNeeds).frozenStorage || 'Not specified'
                                                : 'Not specified'
                                        )}
                                    </p>
                                </div>
                            )}

                            <div className="details-section">
                                <h4>Licenses</h4>
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

                            <div className="details-section">
                                <h4>Additional Notes</h4>
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
                    <span>Filter by Stir Membership Date:</span>

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