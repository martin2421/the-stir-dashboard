import React, { useState, useEffect } from 'react';
import './AddProspectModal.css';

const AddProspectModal = ({ isOpen, onClose, onSubmit }) => {
    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        service: '',
        businessName: '',
        businessStage: '',
        businessType: '',
        createdAt: new Date().toISOString().split('T')[0],
        dateSignedUp: '',
        eventVenue: '',
        storageNeeds: '',
        notes: '',
        licenses: JSON.stringify({
            "Stir Maker Membership": false,
            "Valid FoodSafe Level 1 Certification": false,
            "Interior Health Food Premises Approval": false,
            "Commercial Liability Insurance": false,
            "City of Kamloops Business License": false,
            "Completed 2-Year Business Plan": false,
            "Food Corridor Membership": false,
            "Client Interest Form": false
        }),
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [eventVenueData, setEventVenueData] = useState({
        venue_location: 'Indoor',
        venue_capacity: '',
        venue_equipment: '[]'
    });
    const [storageNeedsData, setStorageNeedsData] = useState({
        dryStorage: '0',
        frozenStorage: '0'
    });
    const [venueEquipment, setVenueEquipment] = useState([]);
    const [licenseData, setLicenseData] = useState({
        "Stir Maker Membership": false,
        "Valid FoodSafe Level 1 Certification": false,
        "Interior Health Food Premises Approval": false,
        "Commercial Liability Insurance": false,
        "City of Kamloops Business License": false,
        "Completed 2-Year Business Plan": false,
        "Food Corridor Membership": false,
        "Client Interest Form": false
    });

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
            setErrors({});
            setEventVenueData({
                venue_location: 'Indoor',
                venue_capacity: '',
                venue_equipment: '[]'
            });
            setStorageNeedsData({
                dryStorage: '0',
                frozenStorage: '0'
            });
            setVenueEquipment([]);
            setLicenseData({
                "Stir Maker Membership": false,
                "Valid FoodSafe Level 1 Certification": false,
                "Interior Health Food Premises Approval": false,
                "Commercial Liability Insurance": false,
                "City of Kamloops Business License": false,
                "Completed 2-Year Business Plan": false,
                "Food Corridor Membership": false,
                "Client Interest Form": false
            });
        }
    }, [isOpen]);

    // Update eventVenue and storageNeeds JSON strings when their data changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            eventVenue: JSON.stringify(eventVenueData)
        }));
    }, [eventVenueData]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            storageNeeds: JSON.stringify(storageNeedsData)
        }));
    }, [storageNeedsData]);

    // Update licenses JSON string when licenseData changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            licenses: JSON.stringify(licenseData)
        }));
    }, [licenseData]);

    // Update venue equipment when checkboxes change
    useEffect(() => {
        setEventVenueData(prev => ({
            ...prev,
            venue_equipment: JSON.stringify(venueEquipment)
        }));
    }, [venueEquipment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear validation error when field is changed
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleVenueLocationChange = (value) => {
        setEventVenueData(prev => ({
            ...prev,
            venue_location: value
        }));
    };

    const handleEquipmentChange = (item) => {
        if (venueEquipment.includes(item)) {
            setVenueEquipment(venueEquipment.filter(i => i !== item));
        } else {
            setVenueEquipment([...venueEquipment, item]);
        }
    };

    const handleStorageChange = (type, value) => {
        setStorageNeedsData(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleLicenseChange = (licenseName, isChecked) => {
        setLicenseData(prev => ({
            ...prev,
            [licenseName]: isChecked
        }));
    };

    const handlePhoneChange = (e) => {
        // Format phone number as they type
        const value = e.target.value.replace(/\D/g, '').substring(0, 10);

        if (value.length > 0) {
            let formattedValue = '';
            if (value.length <= 3) {
                formattedValue = `(${value}`;
            } else if (value.length <= 6) {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            }
            setFormData({
                ...formData,
                phoneNumber: formattedValue
            });
        } else {
            setFormData({
                ...formData,
                phoneNumber: ''
            });
        }

        if (errors.phoneNumber) {
            setErrors({
                ...errors,
                phoneNumber: null
            });
        }
    };

    // const validateForm = () => {
    //     const newErrors = {};

    //     // Required fields validation
    //     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    //     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    //     // Email validation
    //     if (!formData.email.trim()) {
    //         newErrors.email = 'Email is required';
    //     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //         newErrors.email = 'Email is invalid';
    //     }

    //     // Phone validation
    //     if (!formData.phoneNumber) {
    //         newErrors.phoneNumber = 'Phone number is required';
    //     } else if (formData.phoneNumber.replace(/\D/g, '').length !== 10) {
    //         newErrors.phoneNumber = 'Phone number must be 10 digits';
    //     }

    //     // Service validation
    //     if (!formData.service) newErrors.service = 'Service type is required';

    //     // Venue capacity validation for Event Venue
    //     if (formData.service === 'Event Venue Rental' && !eventVenueData.venue_capacity) {
    //         newErrors.venue_capacity = 'Venue capacity is required';
    //     }

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    const validateForm = () => {
        const errors = {};
        
        // Remove required validation for firstName, lastName, email, and phoneNumber
        // Only validate if these fields have content but are invalid
        
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
        
        // Business name could still be required if needed
        if (!formData.businessName?.trim()) {
            errors.businessName = "Business name is required";
        }
        
        // Service is still required
        if (!formData.service) {
            errors.service = "Service is required";
        }
        
        // Check if phone number format is valid but only if provided
        if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
            errors.phoneNumber = "Phone number must be 10 digits";
        }
        
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        // Create a new client object
        const newClient = {
            ...formData,
            id: Date.now().toString() // Generate a unique ID
        };
    
        // Only include eventVenue if service is Event Venue
        if (formData.service !== 'Event Venue Rental') {
            newClient.eventVenue = '';
        }
    
        // Only include storageNeeds if service is Warehouse
        if (formData.service !== 'Warehouse Storage Rental') {
            newClient.storageNeeds = '';
        }
    
        // Ensure createdAt is set to today if not provided
        if (!newClient.createdAt) {
            newClient.createdAt = new Date().toISOString().split('T')[0];
        }
    
        // Submit the data
        onSubmit(newClient);
        
        // Close the modal
        onClose();
    };

    if (!isOpen) return null;

    const isEventVenue = formData.service === 'Event Venue Rental';
    const isWarehouse = formData.service === 'Warehouse Storage Rental';
    const isKitchenOrEcommerce = ['Commercial Kitchen Rental', 'E-Commerce'].includes(formData.service);
    const isCoaching = formData.service === 'Food Business Coaching';
    const showBusinessStage = formData.service === 'Commercial Kitchen Rental';

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Prospect</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="prospect-form">
                        <div className="form-section">
                            <h3>Contact Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        className={errors.firstName ? 'error' : ''}
                                    />
                                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleChange}
                                        className={errors.lastName ? 'error' : ''}
                                    />
                                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && <div className="error-message">{errors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={handlePhoneChange}
                                        placeholder="(xxx) xxx-xxxx"
                                        className={errors.phoneNumber ? 'error' : ''}
                                    />
                                    {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Service Information</h3>
                            <div className="form-group">
                                <label htmlFor="service">
                                    Service Type <span className="required">*</span>
                                </label>
                                <select
                                    id="service"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className={errors.service ? 'error' : ''}
                                >
                                    <option value="">Select a service</option>
                                    <option value="Commercial Kitchen Rental">Commercial Kitchen Rental</option>
                                    <option value="Warehouse Storage Rental">Warehouse Storage Rental</option>
                                    <option value="Event Venue Rental">Event Venue Rental</option>
                                    <option value="Food Business Coaching">Food Business Coaching</option>
                                    <option value="E-Commerce">E-Commerce</option>
                                </select>
                                {errors.service && <div className="error-message">{errors.service}</div>}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Business Information</h3>
                            <div className="form-group">
                                <label htmlFor="businessName">Business Name</label>
                                <input
                                    type="text"
                                    id="businessName"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                />
                            </div>

                            {showBusinessStage && (
                                <div className="form-group">
                                    <label htmlFor="businessStage">Business Stage</label>
                                    <select
                                        id="businessStage"
                                        name="businessStage"
                                        value={formData.businessStage}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a stage</option>
                                        <option value="Brand New">Brand New</option>
                                        <option value="Getting Started">Getting Started</option>
                                        <option value="Up N Running">Up N Running</option>
                                        <option value="Established">Established</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            {(isKitchenOrEcommerce || isCoaching) && (
                                <div className="form-group">
                                    <label htmlFor="businessType">Business Type</label>
                                    <select
                                        id="businessType"
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a type</option>
                                        {isKitchenOrEcommerce && (
                                            <>
                                                <option value="Baker">Baker</option>
                                                <option value="Beverage Manufacturer">Beverage Manufacturer</option>
                                                <option value="Caterer">Caterer</option>
                                                <option value="Chef or Restauranter">Chef or Restauranter</option>
                                                <option value="Consumer Packaged Goods (CPG)">Consumer Packaged Goods (CPG)</option>
                                                <option value="Delivery Only">Delivery Only</option>
                                                <option value="Educator or Cooking Instructor">Educator or Cooking Instructor</option>
                                                <option value="Food Truck / Mobile Vendor">Food Truck / Mobile Vendor</option>
                                                <option value="Meal Prep / Kits">Meal Prep / Kits</option>
                                                <option value="Non-food Products">Non-food Products</option>
                                                <option value="Pet Food Maker">Pet Food Maker</option>
                                                <option value="Value-added Producer or Farmer (not baker)">Value-added Producer or Farmer (not baker)</option>
                                                <option value="Other">Other</option>
                                            </>
                                        )}
                                        {isCoaching && (
                                            <>
                                                <option value="Food Business Planning">Food Business Planning</option>
                                                <option value="Food Safetly Planning">Food Safetly Planning</option>
                                                <option value="Product Development">Product Development</option>
                                                <option value="Water Activity and pH Testing">Water Activity and pH Testing</option>
                                                <option value="Regulatory Requirements">Regulatory Requirements</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="createdAt">Account Created At</label>
                                    <input
                                        type="date"
                                        id="createdAt"
                                        name="createdAt"
                                        value={formData.createdAt}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dateSignedUp">Date Signed Up as Stir Member</label>
                                    <input
                                        type="date"
                                        id="dateSignedUp"
                                        name="dateSignedUp"
                                        value={formData.dateSignedUp}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Licenses & Certifications</h3>
                            <div className="checkbox-grid">
                                {Object.keys(licenseData).map((licenseName) => (
                                    <div className="license-checkbox" key={licenseName}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={licenseData[licenseName]}
                                                onChange={(e) => handleLicenseChange(licenseName, e.target.checked)}
                                            />
                                            {licenseName}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isEventVenue && (
                            <div className="form-section">
                                <h3>Event Venue Details</h3>
                                <div className="form-group">
                                    <label>Venue Location</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="venue_location"
                                                checked={eventVenueData.venue_location === 'Indoor'}
                                                onChange={() => handleVenueLocationChange('Indoor')}
                                            /> Indoor
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="venue_location"
                                                checked={eventVenueData.venue_location === 'Outdoor'}
                                                onChange={() => handleVenueLocationChange('Outdoor')}
                                            /> Outdoor
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="venue_capacity">
                                        Venue Capacity <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="venue_capacity"
                                        name="venue_capacity"
                                        value={eventVenueData.venue_capacity}
                                        onChange={(e) => setEventVenueData({ ...eventVenueData, venue_capacity: e.target.value })}
                                        placeholder="e.g., 1-150"
                                        className={errors.venue_capacity ? 'error' : ''}
                                    />
                                    {errors.venue_capacity && <div className="error-message">{errors.venue_capacity}</div>}
                                </div>

                                <div className="form-group">
                                    <label>Venue Equipment</label>
                                    <div className="checkbox-group">
                                        {['Folding Tables', 'Folding Chairs', 'Speakers', 'Microphone', 'Projector', 'Projector Screen'].map((item) => (
                                            <label key={item}>
                                                <input
                                                    type="checkbox"
                                                    checked={venueEquipment.includes(item)}
                                                    onChange={() => handleEquipmentChange(item)}
                                                /> {item}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isWarehouse && (
                            <div className="form-section">
                                <h3>Storage Needs</h3>
                                <div className="form-group">
                                    <label>Dry/Ambient Storage</label>
                                    <div className="radio-group">
                                        {['0', '1', '2', '3+'].map((value) => (
                                            <label key={`dry-${value}`}>
                                                <input
                                                    type="radio"
                                                    name="dryStorage"
                                                    value={value}
                                                    checked={storageNeedsData.dryStorage === value}
                                                    onChange={() => handleStorageChange('dryStorage', value)}
                                                /> {value}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Frozen Storage</label>
                                    <div className="radio-group">
                                        {['0', '1', '2', '3+'].map((value) => (
                                            <label key={`frozen-${value}`}>
                                                <input
                                                    type="radio"
                                                    name="frozenStorage"
                                                    value={value}
                                                    checked={storageNeedsData.frozenStorage === value}
                                                    onChange={() => handleStorageChange('frozenStorage', value)}
                                                /> {value}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-section">
                            <h3>Additional Information</h3>
                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Enter any additional notes or requirements..."
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                            <button type="submit" className="submit-button">Add Prospect</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProspectModal;