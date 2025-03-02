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

    const updateClient = async (updatedClient) => {
        const params = {
            TableName: 'stir-test2',
            Key: {
                id: updatedClient.id
            },
            UpdateExpression: 'set firstName = :fn, lastName = :ln, businessName = :bn, ' +
                'email = :e, phoneNumber = :p, businessStage = :bs, eventVenue = :ev, ' +
                'eventVenueTimes = :evt, notes = :n, spaceNeeds = :sn, services = :sv, ' +
                'products = :pr, licenses = :lc, createdAt = :ca, signedUp = :su',
            ExpressionAttributeValues: {
                ':fn': updatedClient.firstName,
                ':ln': updatedClient.lastName,
                ':bn': updatedClient.businessName,
                ':e': updatedClient.email,
                ':p': updatedClient.phoneNumber,
                ':bs': updatedClient.businessStage,
                ':ev': updatedClient.eventVenue,
                ':evt': updatedClient.eventVenueTimes,
                ':n': updatedClient.notes,
                ':sn': updatedClient.spaceNeeds,
                ':sv': updatedClient.services,
                ':pr': updatedClient.products,
                ':lc': updatedClient.licenses,
                ':ca': updatedClient.createdAt,
                ':su': updatedClient.signedUp
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            await dynamoDB.update(params).promise();
            // Refresh the clients list after update
            await fetchClients();
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