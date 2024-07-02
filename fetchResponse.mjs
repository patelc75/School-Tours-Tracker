import https from 'https';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const handler = async (event) => {
  return new Promise((resolve, reject) => {
    // GraphQL API endpoint

    const apiUrl = 'current--supabase-hr91aq.apollographos.net';

    // GraphQL query
    const query = `
      query GetFollowsWithHighSchoolsByWatchUUID($watchUUID: UUID!) {
        high_schoolsCollection(filter: { watch_uuid: { eq: $watchUUID } }) {
          edges {
            node {
              id
              created_at
              name
              code
              tour_page_url
              watch_uuid
              followsCollection {
                edges {
                  node {
                    id
                    email
                    created_at
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;



    const queryStringParameters = event.queryStringParameters;
    const watchUUID = queryStringParameters.watch_uuid;
    //const watchUUID = "021c21a0-2706-4fe2-b7ec-eb9818a7c56a";
    console.log('watchUUID: ', watchUUID);
    const variables = {
      watchUUID: watchUUID
    };

    
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
            response.data.high_schoolsCollection.edges.forEach(highSchoolEdge => {
                const highSchool = highSchoolEdge.node;
                console.log('highSchool.name: ' + highSchool.name);
                highSchool.followsCollection.edges.forEach(followEdge => {
                    const follow = followEdge.node;
                    console.log('follow.email: ' + follow.email);
                    const data = sendEmail(follow);
                    console.log("Email sent successfully:", data);
                });
            });

          const highSchools = response.data.high_schoolsCollection.edges;
          const formattedResult = highSchools.map(edge => {
            const highSchool = edge.node;
            return {
              high_school: {
                id: highSchool.id,
                created_at: highSchool.created_at,
                name: highSchool.name,
                code: highSchool.code,
                tour_page_url: highSchool.tour_page_url,
                watch_uuid: highSchool.watch_uuid
              },
              follows: highSchool.followsCollection.edges.map(followEdge => followEdge.node)
            };
          });

          resolve({
            statusCode: 200,
            body: JSON.stringify(formattedResult),
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

    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
};

async function sendEmail(email) {
  const emailParams = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: "This is the email body in text format.",
        },
        Html: {
          Charset: "UTF-8",
          Data: "<html><body><h1>This is the email body in HTML format.</h1></body></html>",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Email Subject",
      },
    },
    Source: "nychighschooltourtracker@gmail.com",
  };
  const sesClient = new SESClient({ region: "us-west-2" });

  const data = sesClient.send(new SendEmailCommand(emailParams));
  return data;
}

