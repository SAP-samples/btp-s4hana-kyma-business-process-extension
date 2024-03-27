# Publishing your application to SAP Build Work Zone, standard Edition Site
 
### Open SAP Build Work Zone, standard Edition

1. Login to your SAP BTP account.
2. Check if your user has access to open the SAP Build Work Zone, standard Edition application, check and assign the role collection **Launchpad_admin** to your user following [Assign Role for SAP Launchpad](https://help.sap.com/viewer/8c8e1958338140699bd4811b37b82ece/Cloud/en-US/fd79b232967545569d1ae4d8f691016b.html).
3. Select **Services** and choose **Instances and Subscriptions**. 
4. Select the tab **Subscriptions**, look for **SAP Build Work Zone, standard Edition**, Select the three dots **...** to open the relevant **Actions**. Select **Go to Application** to open the **SAP SAP Build Work Zone, standard Edition** service. 

   ![Open Biz App Studio](./images/openLaunchpad.png)
   
5. Enter your SAP BTP email and password or your custom Identity Provider credentials to login to the SAP Build Work Zone, standard Edition Application which opens in a separate browser tab.


### Add HTML5 applications to necessary Group and Role
  
1. Select on **Provider Manager** to check the Content Providers and to refresh the list of HTML5 Applications. 

   ![check Created Site](./images/checkCreatedSite.png)
   
2.  Select **Fetch Updated Content** to manually fetch any new HTML5 applications deployed to the SAP BTP. This will fetch any new content deployed. Then Select **Content Manager** to look and add the HTML5 apps to SAP Build Work Zone, standard Edition site.

   ![refresh Content](./images/refreshContent.png)
   
3. In **Content Manager**, Select  **Content Explorer** tab and Select **HTML5 Apps** to see the list of HTML5 applications to be added to the SAP Build Work Zone, standard Edition site.

    ![open Content Explorer](./images/openContentExplorer.png)
    
4. Select your HTML5 application: **Business Partner** from the list and Select **Add to Content**. 

   ![add App to Content](./images/addApptoContent.png)

5. Select **My Content** and choose **New** and Select **New Role** to create a role for this applicationapplications.

   ![addSFSFRole1](./images/addSFSFRole1.png)
   
6. Enter a meaningful **Title** and **Description**. Navigate to **Assignments** section, Select the **Search** icon which displays both the HTML5 applications, Select the **+** icon next to **Business Partner** app and Select **Save** to save the new role which has now access to the HTML5 application.

   ![addSFSFRole2](./images/addSFSFRole2.png)

7. Select **back** icon to go back to the previous screen and Select **New** and Select **Group** to create a new group.

   ![create Group1](./images/createGroup1.png)
   
8. Enter a group name, for example: **BPGroup** and a valid description. In the **Assignments** section, Select the **Search** icon which displays the HTML5 application, Select the **+** icon next to **Business Partner** app and Select **Save** to save the new group.

   ![create Group2](./images/createGroup2.png)
   
   
### Create a SAP Build Work Zone, standard Edition Site

1. Select **Site Directory** to create a new SAP Build Work Zone, standard Edition site for your company.
   
2. Select  **Create Site** to create a company SAP Build Work Zone, standard Edition site.
   
   ![createSite1](./images/createSite1.png)

3. Enter a site name, for example : **companyLaunchpadSite** and Select **Create**.

   ![create Site2](./images/createSite2.png)
   
4. Select **Edit** and in the **Assignments** section, Select the search icon and select the created role **BusinessPartnerRole** and choose **Save**.
 
   ![create Site3](./images/createSite3.png)
   
 5. You can see the company SAP Build Work Zone, standard Edition site URL in the URL field. 
  <a id="copyURL"></a>
   ![open Created Site](./images/openCreatedSite.png)


### Assign Role to Users

1. Switch to your SAP BTP account cockpit.
2. Select **Role Collections** and select the role which you created in the previous step, for example: **BusinessPartnerRole**.

   ![assignrole1](./images/assignrole1.png)
   
3. Select **Edit** and in the **Users** section, enter the **ID**, choose the **Identity Provider** and enter **E-mail** for all the users who would access the SAP Build Work Zone, standard Edition site. 

    ![assignrole2](./images/assignRole2.png)
    
 4. You can now access the SAP Build Work Zone, standard Edition site URL which you copied in the previous step. If you do not have authorizations, try to logout and login with the user or open in a private browser window. You will see the **Business Partner** HTML5 applications.

    ![open Site](./images/openSite.png)    
    

### Result

You have successfully created a SAP Build Work Zone, standard Edition site, giving necessary roles and groups and added your HTML5 application to the SAP Build Work Zone, standard Edition site.