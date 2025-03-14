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

    // In useClientData.js
    const updateClient = async (updatedClient) => {
        // Make a copy to avoid mutating the original object
        const clientToUpdate = { ...updatedClient };

        // Ensure products and services are handled properly
        if (Array.isArray(clientToUpdate.products)) {
            // Keep as array, no need to stringify
        } else if (typeof clientToUpdate.products === 'string' && clientToUpdate.products.startsWith('[')) {
            try {
                clientToUpdate.products = JSON.parse(clientToUpdate.products);
            } catch (e) {
                // If can't parse, split by commas
                clientToUpdate.products = clientToUpdate.products.split(',').map(p => p.trim());
            }
        }

        if (Array.isArray(clientToUpdate.services)) {
            // Keep as array, no need to stringify
        } else if (typeof clientToUpdate.services === 'string' && !clientToUpdate.services.startsWith('[')) {
            clientToUpdate.services = clientToUpdate.services.split(',').map(s => s.trim());
        }

        const params = {
            TableName: 'stir-test2',
            Key: {
                id: clientToUpdate.id
            },
            UpdateExpression: 'set firstName = :fn, lastName = :ln, businessName = :bn, ' +
                'email = :e, phoneNumber = :p, businessStage = :bs, eventVenue = :ev, ' +
                'notes = :n, spaceNeeds = :sn, services = :sv, ' +
                'products = :pr, licenses = :lc, createdAt = :ca, dateSignedUp = :dsu',
            ExpressionAttributeValues: {
                ':fn': clientToUpdate.firstName,
                ':ln': clientToUpdate.lastName,
                ':bn': clientToUpdate.businessName,
                ':e': clientToUpdate.email,
                ':p': clientToUpdate.phoneNumber,
                ':bs': clientToUpdate.businessStage,
                ':ev': clientToUpdate.eventVenue,
                ':n': clientToUpdate.notes,
                ':sn': clientToUpdate.spaceNeeds,
                ':sv': clientToUpdate.services,
                ':pr': clientToUpdate.products,
                ':lc': clientToUpdate.licenses,
                ':ca': clientToUpdate.createdAt,
                ':dsu': clientToUpdate.dateSignedUp,
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

    // Call fetchClients when component mounts
    useEffect(() => {
        fetchClients();
    }, []);

    return { clients, loading, error, updateClient };
};