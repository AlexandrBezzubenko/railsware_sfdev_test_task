public with sharing class UpdateSenderNameController {

    @AuraEnabled(cacheable=true)
    public static User getUser(Id userId) {
        try {
            return getCurrentUser(userId);            
        } catch (Exception e) {
            throw new AuraException(e.getMessage());
        }
    }

    private static User getCurrentUser(Id userId) {
        return [
                SELECT Id, Name, SenderName
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];
    }
    
}