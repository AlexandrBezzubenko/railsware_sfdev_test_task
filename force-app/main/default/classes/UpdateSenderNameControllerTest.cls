@IsTest
private class UpdateSenderNameControllerTest {
 
    @TestSetup
    private static void testSetup(){
        insertTestUser();
    }

    @IsTest
    private static void getUserSuccess() {
        final String expectedName = 'John Doe';
        final Id userId = getUserIdByName(expectedName);

        Test.startTest();
        
        User user = UpdateSenderNameController.getUser(userId);
        Test.stopTest();

        System.assertEquals(expectedName, user.Name);
    }
    

    @IsTest
    private static void getUserFail() {
        final Id userId = null;
        final String EXPECTED_ERROR_MESSAGE = 'List has no rows for assignment to SObject';
        String actualErrorMessage;

        Test.startTest();
        try {
            User user = UpdateSenderNameController.getUser(userId);
        } catch(Exception e) {
            actualErrorMessage = e.getMessage();
        }
        Test.stopTest();

        System.assertEquals(EXPECTED_ERROR_MESSAGE, actualErrorMessage);
    }

    private static void insertTestUser() {
        User user = new User();
        user.FirstName = 'John';
        user.LastName = 'Doe';
        user.Username = 'john.doe@test.com';
        user.Email = 'john.doe@test.com';
        user.Alias = 'JDoe';
        user.TimeZoneSidKey = 'America/Los_Angeles';
        user.LocaleSidKey = 'en_US';
        user.EmailEncodingKey = 'UTF-8';
        user.ProfileId = getStandartUserProfileId();
        user.LanguageLocaleKey = 'en_US';

        insert user;
    }

    private static Id getStandartUserProfileId() {
        final String STANDARD_USER_PROFLE_NAME = 'Standard User';

        return [SELECT Id FROM Profile WHERE Name = :STANDARD_USER_PROFLE_NAME].Id;
    }

    private static Id getUserIdByName(String Name) {
        return [SELECT Id FROM User WHERE Name = :Name LIMIT 1].Id;
    }
}