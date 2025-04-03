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
        fetchClients,
        fetchArchivedClients
    };
};