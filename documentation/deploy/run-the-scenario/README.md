## Test Entire Business Scenario End-To-End

1. Start your Business Partner Validation Application:

- Go to **Instances and Subscriptions**.
- Find **SAP Build Work Zone** and click to open the application.
- In the Website Manager find your created Website and click on tile to open it.
- Click on **Business Partner Validation** tile.
- The list of BusinessPartners along with their verification status gets displayed.

 ![App](./images/endtoend2.png)

2. Log on to your SAP S/4HANA on-premise system.

 ![Backend](./images/endtoend3.png)

3. Enter transaction code `bp`.

 ![Backend](./images/endtoend4.png)

4. Create a new Business Partner.

- Choose **Person**.

 ![Backend](./images/endtoend5.png)

- Provide **First name** and **Last name** for the Business Partner.

 ![Backend](./images/endtoend6.png)

- Provide the **Street Address**.

 ![Backend](./images/endtoend7.png)

 - Navigate to the **Status** tab and check mark the **Central Block** lock. Save the Business Partner. It creates a new Business Partner.

 ![Backend](./images/endtoend8.png)

5. Now, go back to the **Business Partner Validation** application to see if the new Business Partner has appeared as a new entry in the UI.

 ![App](./images/endtoend9.png)

6. Go to the details page for the new BusinessPartner.

7. Choose **Edit** and set the **Status** to **Verified**.

 ![Backend](./images/endtoend10.png)

8. (Optional) You can configure SAP Event Mesh in a way so that you can see the created event. For that you could create an additional queue that subscribes to the topic as well.

 ![Backend](./images/endtoend11.png)

9. Go to your SAP S/4HANA on-premise system.

10. Go to transaction **bp**.

 ![Backend](./images/endtoend4.png)

11. Open the details of the Business Partner that you have set to **VERIFIED**.

 ![Backend](./images/endtoend12.png)

12. Navigate to the **Status** tab. You can see that the **Central Block** lock has been removed.

 ![Backend](./images/endtoend13.png)

13. The serverless application has also uploaded a QR code for the address details of the Business Partner to the SAP S/4HANA system.
You can view this by clicking on the icon in the top left corner. You will have to give permission for downloading the image.

![attachment List](./images/attachmentList.png)

17. You can also notice that in the Business Partner Validation UI, the status is now set as **COMPLETED**.
