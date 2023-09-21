import { LightningElement,  track, wire } from 'lwc';

import USER_ID from "@salesforce/user/Id";

import ID_FIELD from '@salesforce/schema/User.Id';
import SENDERNAME_FIELD from '@salesforce/schema/User.SenderName';

import getUser from '@salesforce/apex/UpdateSenderNameController.getUser';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class UpdateSenderName extends LightningElement {
    userId;
    @track user;
    isInputInvalid = false;

    isLoading = true;

    dataToRefresh;

    searchKeyDebounced;

    doneTypingInterval = 300;
    typingTimer;

    @wire(getUser, {userId: USER_ID})
    wiredUser(result) {
        this.dataToRefresh = result;
        if (result.data) {
            this.user = result.data;
            this.hideSpinner();
        } else if (result.error) {
            this.showErrorToast(result.error.body.message)
            this.hideSpinner();
        }
    }

    get currentSenderName() {
        let name = this.user?.Name;
        let senderName = this.user?.SenderName;

        return senderName ? senderName : name;
    }

    handleInputChange(event) {
        clearTimeout(this.typingTimer);
        let inputValue = event.target.value;

        this.typingTimer = setTimeout(() => {
            if (inputValue){
                this.validateInput();
            }
        }, this.doneTypingInterval);
    }

    validateInput() {
        let newSenderNameInput = this.refs.newSenderName;
        if (newSenderNameInput.value === this.currentSenderName) {
            newSenderNameInput.setCustomValidity("New Sander Name should be differ from current");
            this.isInputInvalid = true;
        } else {
            newSenderNameInput.setCustomValidity("");
            this.isInputInvalid = false;
        }
        newSenderNameInput.reportValidity();
    }
    
    get isSaveButtonDisabled() {
        return this.isLoading || this.isInputInvalid;
    }

    handleSave() {
        this.showSpinner();

        const fields = {};
        fields[ID_FIELD.fieldApiName] = USER_ID;
        fields[SENDERNAME_FIELD.fieldApiName] = this.refs.newSenderName.value;

        updateRecord({ fields })
        .then(() => {
            refreshApex(this.dataToRefresh)
                .then(() => {
                    this.clearInput();
                })
                .catch((e) => {
                    //TODO: handle error
                    console.log(e.message);
                })
                .finally(() => {
                    this.hideSpinner()
                });
        })
    }

    clearInput() {
        this.refs.newSenderName.value = null;
    }

    showSpinner() {
        this.isLoading = true;
    }

    hideSpinner() {
        this.isLoading = false;
    }

    showErrorToast(message) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'sticky'
        });
        this.dispatchEvent(event);

        console.log('tost event fired');
    }
}