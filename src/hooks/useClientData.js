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

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const params = {
                    // Josue's Table
                    // TableName: 'Prospects'

                    // Martin Table
                    TableName: 'stir-test2'
                };
                const result = await dynamoDB.scan(params).promise();
                setClients(result.Items);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    return { clients, loading, error };
};