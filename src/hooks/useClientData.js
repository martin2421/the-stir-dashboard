import { useState, useEffect } from 'react';
import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient({
    region: 'your-region',
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
});

export const useClientData = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const params = {
                    TableName: 'your-table-name'
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