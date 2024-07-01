import https from 'https';

export const handler = async (event) => {
  return new Promise((resolve, reject) => {
    // GraphQL API endpoint

    const apiUrl = 'current--supabase-hr91aq.apollographos.net';

    // GraphQL query
    const query = `
        query GetHighSchoolByWatchUUID() {
            high_schoolsCollection(filter: { watch_uuid: { eq: "$specificWatchUUID" } }) {
                edges {
                    node {
                        id
                        created_at
                        name
                        code
                        tour_page_url
                        watch_uuid
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `;
    const originalQuery = `
        query GetHighSchool() {
            high_schoolsCollection() {
                edges {
                    node {
                        id
                        created_at
                        name
                        code
                        tour_page_url
                        watch_uuid
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `;

    const queryWithWatchUUID = query.replace("$specificWatchUUID", "021c21a0-2706-4fe2-b7ec-eb9818a7c56a");
    console.log('queryWithWatchUUID:', queryWithWatchUUID);

    const options = {
      hostname: apiUrl,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvc29sa3Zqb2xqbGZrcGpicXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxMDI1NDUsImV4cCI6MjAzMDY3ODU0NX0.XSP5eEUIryyh-LeukeR94XwCSuGxxDIuZUcZyMqvYJU' // from apollo
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          // Check for GraphQL errors
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          // Process the successful response
          const result = response.data;

          resolve({
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Error:', error);
          resolve({
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    req.write(JSON.stringify({ originalQuery }));
    req.end();
  });
};

