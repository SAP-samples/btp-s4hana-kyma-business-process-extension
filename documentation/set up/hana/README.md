# Create an SAP HANA Cloud Instance

For this mission, we will SAP HANA Cloud as our persistence layer.
Use the following steps to create an SAP HANA Cloud instance on SAP BTP:

1. Navigate to SAP HANA Cloud Subscription Application:

    1. In SAP BTP cockpit navigate to the **Services** &rarr; **Instances and Subscriptions** and **SAP HANA Cloud**.
    2. Select the three dots and choose **Go to Application**.

    ![HANA](./images/hanatools.png)

2. In the SAP BTP cockpit, enter the space you have created in the previous tutorial.

3. Select the **SAP HANA Cloud** section and choose **Create** and in the dropdown then select **SAP HANA Database**.

    ![HANA](./images/createDatabase.png)

4. You will be logged in to SAP HANA Cloud Central. Choose the type of SAP HANA Cloud instance as **SAP HANA Cloud, SAP HANA Database** and select **Next Step**.

   ![HANA](./images/createDatabase02.png)

5. In the next tab, choose the SAP BTP **Organization** and **Space** from the dropdown box. Enter an **Instance name**, also enter a valid database **Administrator Password**, and select **Next Step**.

   ![HANA](./images/createDatabase03.png)

6. Select the **Memory** and **Storage** capacity for your SAP HANA Cloud database instance. For this mission, you can choose the minimum capacity and select **Next Step**.

   ![HANA](./images/createDatabase04.png)

7. In the tab for Availability Zone and Replicas, you can leave the defaults and choose **Next Step**.

   ![HANA](./images/createDatabase05.png)

8. In the tab for SAP HANA Advanced Settings, choose **Allow all IP Addresses** and choose **Review and Create**.

   ![HANA](./images/createDatabase06.png)

9. Choose **Create Instance** to create an instance of SAP HANA Cloud Database instance.

    ![HANA](./images/createDatabase07.png)

    The creation of the instance will take some minutes.

