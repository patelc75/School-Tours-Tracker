import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const handler = async (event) => {
    const emailParams = {
      Destination: {
        ToAddresses: ["chirag@chirag.name"],
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
  
    try {
      const queryStringParameters = event.queryStringParameters;
      const sesClient = new SESClient({ region: "us-west-2" });
  
      const data = await sesClient.send(new SendEmailCommand(emailParams));
      console.log("Email sent successfully:", data);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Email sent successfully " + queryStringParameters.watch_uuid,
          data: data,
        }),
      };
    } catch (err) {
      console.error("Error sending email:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error sending email",
          error: err,
        }),
      };
    }
  };
  