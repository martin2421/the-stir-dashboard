import { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

AWS.config.update({
    region: 'us-east-1',
    endpoint: 'dynamodb.us-east-1.amazonaws.com',
    credentials: new AWS.Credentials({
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    })
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const useClientData = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [archivedClients, setArchivedClients] = useState([]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const params = {
                TableName: 'stir-test2' // your table name
            };
            const result = await dynamoDB.scan(params).promise();
            setClients(result.Items);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    const fetchArchivedClients = async () => {
        try {
            setLoading(true);
            const params = {
                TableName: 'stir-archived'
            };
            const result = await dynamoDB.scan(params).promise();
            setArchivedClients(result.Items);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    const updateClient = async (updatedClient) => {
        // Make a copy to avoid mutating the original object
        const clientToUpdate = { ...updatedClient };

        const params = {
            TableName: 'stir-test2',
            Key: {
                id: clientToUpdate.id
            },
            UpdateExpression: 'set firstName = :fn, lastName = :ln, businessName = :bn, ' +
                'email = :e, phoneNumber = :p, businessStage = :bs, businessType = :bt, ' +
                'service = :sv, eventVenue = :ev, storageNeeds = :sn, ' +
                'notes = :n, licenses = :lc, createdAt = :ca, dateSignedUp = :dsu',
            ExpressionAttributeValues: {
                ':fn': clientToUpdate.firstName || '',
                ':ln': clientToUpdate.lastName || '',
                ':bn': clientToUpdate.businessName || '',
                ':e': clientToUpdate.email || '',
                ':p': clientToUpdate.phoneNumber || '',
                ':bs': clientToUpdate.businessStage || '',
                ':bt': clientToUpdate.businessType || '',
                ':sv': clientToUpdate.service || '',
                ':ev': clientToUpdate.eventVenue || '',
                ':sn': clientToUpdate.storageNeeds || '',
                ':n': clientToUpdate.notes || '',
                ':lc': clientToUpdate.licenses || '{}',
                ':ca': clientToUpdate.createdAt || new Date().toISOString(),
                ':dsu': clientToUpdate.dateSignedUp || '',
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            await dynamoDB.update(params).promise();
            await fetchClients();  // Refresh data after update
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    };

    const addClient = async (newClient) => {
        try {
            // First, find the special entry with id = -1 to get the next available ID
            const specialEntryParams = {
                TableName: 'stir-test2',
                KeyConditionExpression: 'id = :idValue',
                ExpressionAttributeValues: {
                    ':idValue': -1
                }
            };

            let nextId = 0;  // Default value if no special entry exists

            try {
                const specialEntryResult = await dynamoDB.query(specialEntryParams).promise();
                if (specialEntryResult.Items && specialEntryResult.Items.length > 0) {
                    nextId = specialEntryResult.Items[0].nextId;

                    // Update the special entry with incremented nextId
                    const updateSpecialEntryParams = {
                        TableName: 'stir-test2',
                        Key: { id: -1 },
                        UpdateExpression: 'set nextId = :nextIdValue',
                        ExpressionAttributeValues: {
                            ':nextIdValue': nextId + 1
                        }
                    };

                    await dynamoDB.update(updateSpecialEntryParams).promise();
                }
            } catch (specialEntryError) {
                console.error('Error fetching nextId:', specialEntryError);
                // If there's an error, we'll just use the default nextId value
            }

            // Add the new client with the obtained ID
            const clientToAdd = {
                ...newClient,
                id: nextId,
                chatHistory: "chat history goes here",
                currentState: "current state of chatbot goes here"
            };

            const addParams = {
                TableName: 'stir-test2',
                Item: clientToAdd
            };

            await dynamoDB.put(addParams).promise();

            // Refresh the clients list
            await fetchClients();

            return true;
        } catch (error) {
            console.error('Error adding client:', error);
            throw error;
        }
    };

    const archiveClient = async (client) => {
        try {
            // Step 1: Add the client to the archive table
            const archiveParams = {
                TableName: 'stir-archived',
                Item: client
            };

            await dynamoDB.put(archiveParams).promise();

            // Step 2: Delete client from the main table
            const deleteParams = {
                TableName: 'stir-test2',
                Key: {
                    id: client.id
                }
            };

            await dynamoDB.delete(deleteParams).promise();

            // Step 3: Refresh the clients list
            await fetchClients();

            return true;
        } catch (error) {
            console.error('Error archiving client:', error);
            throw error;
        }
    };

    const deleteClient = async (clientToDelete) => {
        try {
            // Determine which table to delete from based on whether it's archived
            const tableName = clientToDelete.isArchived ? 'stir-archived' : 'stir-test2';
            
            // Set up the delete parameters
            const deleteParams = {
                TableName: tableName,
                Key: {
                    id: clientToDelete.id
                }
            };
    
            // Execute the delete operation on DynamoDB
            await dynamoDB.delete(deleteParams).promise();
            
            // Update local state to reflect the change
            if (tableName === 'stir-test2') {
                setClients(prevClients => 
                    prevClients.filter(client => client.id !== clientToDelete.id)
                );
            } else {
                setArchivedClients(prevClients => 
                    prevClients.filter(client => client.id !== clientToDelete.id)
                );
            }
            
            // Refresh data to ensure state is in sync with database
            if (tableName === 'stir-test2') {
                await fetchClients();
            } else {
                await fetchArchivedClients();
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    };

    // Call fetchClients when component mounts
    useEffect(() => {
        const fetchAllData = async () => {
            await fetchClients();
            await fetchArchivedClients();
        };
        fetchAllData();
    }, []);

    return {
        clients,
        archivedClients,
        loading,
        error,
        updateClient,
        archiveClient,
        addClient,
        deleteClient,
        fetchClients,
        fetchArchivedClients
    };
};