import './Table.css'
import React from 'react'

export default function Table() {
    return (
        <>
            <div className="container">
                <img src="https://static.wixstatic.com/media/636f9b_f2871fd983de45dea88cef9593104663~mv2.png/v1/crop/x_28,y_380,w_1426,h_728/fill/w_406,h_208,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/636f9b_f2871fd983de45dea88cef9593104663~mv2.png"
                    className="logo" alt="Logo" />
                <h2>Client Data Table</h2>
                <input type="text" id="searchInput" onKeyUp={searchTable()}
                    placeholder="Search for names, services, or requirements..." />
                <table id="clientTable">
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
                        <tr>
                            <td>John Doe</td>
                            <td>Doe Catering</td>
                            <td>john@example.com</td>
                            <td>123-456-7890</td>
                            <td>Kitchen Rental</td>
                            <td><button className="expand-btn" onClick={toggleDetails('details1')}>View Details</button></td>
                        </tr>
                        <tr id="details1" className="hidden details-row">
                            <td colSpan="6">
                                <div className="details">
                                    <div className="details-column">
                                        <strong>Requirements:</strong>
                                        <ul>
                                            <li>Health Certificate: ✅</li>
                                            <li>Insurance: ❌</li>
                                            <li>Business License: ✅</li>
                                        </ul>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="details-column">
                                        <strong>Products:</strong>
                                        <ul>
                                            <li>Oven</li>
                                            <li>Refrigerator</li>
                                            <li>Dishwasher</li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Jane Smith</td>
                            <td>Smith Logistics</td>
                            <td>jane@example.com</td>
                            <td>987-654-3210</td>
                            <td>Warehouse Unit</td>
                            <td><button className="expand-btn" onClick={toggleDetails('details2')}>View Details</button></td>
                        </tr>
                        <tr id="details2" className="hidden details-row">
                            <td colSpan="6">
                                <div className="details">
                                    <div className="details-column">
                                        <strong>Requirements:</strong>
                                        <ul>
                                            <li>Warehouse Permit: ✅</li>
                                            <li>Business License: ✅</li>
                                        </ul>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="details-column">
                                        <strong>Products:</strong>
                                        <ul>
                                            <li>Forklift</li>
                                            <li>Storage Shelves</li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Michael Johnson</td>
                            <td>Johnson Bakery</td>
                            <td>michael@example.com</td>
                            <td>555-123-4567</td>
                            <td>Kitchen Rental</td>
                            <td><button className="expand-btn" onClick={toggleDetails('details3')}>View Details</button></td>
                        </tr>
                        <tr id="details3" className="hidden details-row">
                            <td colSpan="6">
                                <div className="details">
                                    <div className="details-column">
                                        <strong>Requirements:</strong>
                                        <ul>
                                            <li>Health Certificate: ✅</li>
                                            <li>Insurance: ✅</li>
                                        </ul>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="details-column">
                                        <strong>Products:</strong>
                                        <ul>
                                            <li>Mixing Machine</li>
                                            <li>Cooling Rack</li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}