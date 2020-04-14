import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Cache } from './cache.decorator';
import { ONESIGNAL_APP_ID } from 'app/app.constants';

const logger = (...args: (string | number)[]) => {
  // eslint-disable-next-line no-console
  console.log(...args);
};

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {
  @Cache({ pool: 'OneSignal' }) oneSignalId: any; // store OneSignalId in localStorage
  OneSignal: any = [];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  // Call this method to start the this.OneSignal process.
  public init(): void {
    this.initOneSignal();
  }

  initOneSignal(): void {
    // tslint:disable-next-line:no-string-literal
    this.OneSignal = window['OneSignal'] || [];
    logger('Init this.OneSignal');
    // https://documentation.onesignal.com/docs/web-push-custom-code-examples
    this.OneSignal.push([
      'init',
      {
        appId: ONESIGNAL_APP_ID,
        autoRegister: true,
        notifyButton: {
          enable: true
        },
        allowLocalhostAsSecureOrigin: true
      }
    ]);
    logger('this.OneSignal Initialized');
    this.checkIfSubscribed();
  }

  checkIfSubscribed(): void {
    this.OneSignal.push(() => {
      /* These examples are all valid */
      this.OneSignal.isPushNotificationsEnabled(
        (isEnabled: boolean) => {
          if (isEnabled) {
            logger('Push notifications are enabled!');
            this.getUserID();
          } else {
            logger('Push notifications are not enabled yet.');
            this.subscribe();
          }
        },
        (error: any) => {
          logger('Push permission not granted' + error);
        }
      );
    });
  }

  subscribe(): void {
    this.OneSignal.push(() => {
      logger('Register For Push');
      this.OneSignal.push(['registerForPushNotifications']);
      this.OneSignal.on('subscriptionChange', (isSubscribed: any) => {
        logger("The user's subscription state is now:", isSubscribed);
        this.listenForNotification();
        this.OneSignal.getUserId().then((userId: any) => {
          logger('User ID is', userId);
          this.oneSignalId = userId;
        });
      });
    });
  }

  listenForNotification(): void {
    logger('Initalize Listener');
    this.OneSignal.on('notificationDisplay', (event: any) => {
      logger('this.OneSignal notification displayed:', event);
      this.listenForNotification();
    });
  }

  getUserID(): void {
    this.OneSignal.getUserId().then((userId: any) => {
      logger('User ID is', userId);
      this.oneSignalId = userId;
    });
  }
}
