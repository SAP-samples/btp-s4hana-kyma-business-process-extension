### Demo Script

1. Start your Business Partner Validation Application:

- Go to **Instances and Subscriptions**.
- Find **SAP Build Work Zone** and click to open the application.
- In the Website Manager find your created Website and click on tile to open it.
- Click on **Business Partner Validation** tile.
- The list of Business Partners along with their verification status gets displayed.

 ![App](./images/mock01.png)

2. Create a new Business Partner in the mock server using business partner API:

```
POST https://<mock_srv_url>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner

{
    "BusinessPartner": "25599",
    "BusinessPartnerFullName": "Max Mustermann",
    "FirstName": "Max",
    "LastName": "Mustermann",
    "BusinessPartnerIsBlocked": true,
    "Language": "EN",
    "to_BusinessPartnerAddress": [
        {
            "BusinessPartner": "25599",
            "AddressID": "99",
            "StreetName": "Platz der Republik",
            "HouseNumber": "1",
            "PostalCode": "10557",
            "CityName": "Berlin",
            "Country": "DE",
            "Language": "EN"
        }
    ]
}
```

3. Now, go back to the BusinessPartnerValidation application to see if the new Business Partner has appeared as a new entry in the UI.

 ![App](./images/mock01.png)

4. Go to the details page for the new Business Partner.

5. Choose **Edit** and set the Status to **Verified**.

 ![Backend](./images/mock02.png)

6. (Optional) You can configure SAP Event Mesh in a way so that you can see the created event. For that, you could create an additional queue that subscribes to the topic as well.

 ![Backend](./images/mock03.png)

7. Notice that the changes are reflected back to the Business Partner in the mock server.

```
GET https:/<MOCK_SRV_URL>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('25599')

```

8. Play around with the app.
