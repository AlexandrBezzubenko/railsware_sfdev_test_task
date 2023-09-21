/* eslint-disable @lwc/lwc/no-document-query */
import { createElement } from 'lwc';
import { setImmediate } from 'timers';
import updateSenderName from 'c/updateSenderName';
import getUser from '@salesforce/apex/UpdateSenderNameController.getUser';

jest.useFakeTimers();
jest.mock('@salesforce/apex/UpdateSenderNameController.getUser',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

jest.mock('@salesforce/user/Id',
    () => { return { default: jest.fn() }; },
    { virtual: true }
);

const mockData = require('./data/mockData.json');

const getTestingComponent = () => {
    return document.querySelector('c-update-sender-name');
}

function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
}


describe('Update Sender Name Test Suite', () => {
    beforeEach(() => {
        const testingComponent = createElement('c-update-sender-name', {
            is: updateSenderName
        });
        document.body.appendChild(testingComponent);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });


    test('The component should be rendered', () => {
        const testingComponent = getTestingComponent();
        const card = testingComponent.shadowRoot.querySelector('lightning-card');

        expect(card).not.toBeNull();
    });

    test('Spinner should be shown during initial loading', () => {
        const testingComponent = getTestingComponent();
        const spinnerDuringLoading = testingComponent.shadowRoot.querySelector('lightning-spinner');
        expect(spinnerDuringLoading).not.toBeNull();

        getUser.emit(mockData.userWithEmptySenderNameMock);
        return new Promise(setImmediate)
        .then(() => {
            const spinnerAfterLoading = testingComponent.shadowRoot.querySelector('lightning-spinner');
            expect(spinnerAfterLoading).toBeNull();
        });
    });

    test('Name field value should be shown as Current Sender Name', () => {
        const testingComponent = getTestingComponent();

        getUser.emit(mockData.userWithEmptySenderNameMock);

        return new Promise(setImmediate)
        .then(() => {
            const currentSenderName = testingComponent.shadowRoot.querySelector('.output-field').value;
            
            expect(currentSenderName).toBe(mockData.userWithEmptySenderNameMock.Name);
        });
    });

    test('SenderName field value should be shown as Current Sender Name', () => {
        const testingComponent = getTestingComponent();
        getUser.emit(mockData.userWithFilledSenderNameMock);

        return new Promise(setImmediate).then(() => {
            const currentSenderName = testingComponent.shadowRoot.querySelector('.output-field').value;

            expect(currentSenderName).toBe(mockData.userWithFilledSenderNameMock.SenderName);
        });
    });

    test('Save button should be disabled if new sender name equals current', () => {
        const testingComponent = getTestingComponent();
        const newSenderInput = testingComponent.shadowRoot.querySelector('.input-field');
        const saveButton = testingComponent.shadowRoot.querySelector('lightning-button');
        const newSenderNameToBe = 'John Doe';
        
        getUser.emit(mockData.userWithEmptySenderNameMock);

        return Promise.resolve()
        .then(() => {
            expect(saveButton).toHaveProperty('disabled', false);

            newSenderInput.value = newSenderNameToBe;
            newSenderInput.dispatchEvent(new CustomEvent('change'));
        })
        .then(()=>{
            jest.runAllTimers();
        })
        .then(() => {
            expect(saveButton).toHaveProperty('disabled', true);
        })
    });

    test('New sender name should be saved', () => {
        const testingComponent = getTestingComponent();
        const newSenderInput = testingComponent.shadowRoot.querySelector('.input-field');
        const saveButton = testingComponent.shadowRoot.querySelector('lightning-button');
        const newSenderNameToBe = 'John Snow';
        
        getUser.emit(mockData.userWithEmptySenderNameMock);

        return Promise.resolve()
        .then(() => {
            newSenderInput.value = newSenderNameToBe;
            newSenderInput.dispatchEvent(new CustomEvent('change'));
        })
        .then(() => {
            jest.runAllTimers();
        })
        .then(() => {
            expect(saveButton).toHaveProperty('disabled', false);
            saveButton.dispatchEvent(new CustomEvent('click'));
        })
        .then(() => {
            getUser.emit(mockData.userWithFilledSenderNameMock);
        })
        .then(() => {
            const currentSenderName = testingComponent.shadowRoot.querySelector('.output-field').value;
            expect(currentSenderName).toBe(newSenderNameToBe);
            expect(newSenderInput.value).toBeNull();
        });
    });
});