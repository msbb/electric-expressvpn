import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import {
  Observable,
  from,
  map,
  catchError,
  of,
  timer,
  switchMap,
  BehaviorSubject,
  take,
  tap,
} from 'rxjs';
import { COMMANDS, SETTINGS, STRINGS } from '../../constants';
import { ExpressvpnLocation } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ExpresssvpnLocationsService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  exec: any;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.fs = window.require('fs');
      this.childProcess = window.require('child_process');
      this.exec = util.promisify(window.require('child_process').exec);
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  get locations$(): Observable<Array<ExpressvpnLocation>> {
    return from(this.exec(COMMANDS.LOCATION_LIST)).pipe(
      map((locationsMessage) => {
        const cleanLocationsString = `${locationsMessage}`
          .replace('ALIAS', '')
          .replace('COUNTRY', '')
          .replace('LOCATION', '')
          .replace('RECOMMENDED', '')
          .replace(/--/g, '')
          // turn all multiple spaces to single space
          .replace(/ +(?= )/g, '');
        const locationsStringArray = cleanLocationsString
          .split('\n')
          .map((row) => row.trim())
          // remove empty rows
          .filter((row) => !!row)
          // remove rows that only contains spaces or dashes
          .filter((row) => !row.match(/^[- ]*$/))
          // remove redundant row
          .filter((row) => !row.includes('Pick for Me'));

        let lastCountry!: string;

        const mappedLocations: Array<ExpressvpnLocation> =
          locationsStringArray.map((locationString) => {
            const SMART_LOCATION_STRING = 'Smart Location';
            const alias = locationString.split(' ')[0];
            const withoutAlias = locationString.replace(alias, '');
            const lastCharacter = withoutAlias.charAt(withoutAlias.length - 1);
            const recommended = lastCharacter === 'Y';
            const stringWithoutRecommended = recommended
              ? withoutAlias.slice(0, -1).trim()
              : withoutAlias.trim();
            const countryIsSmartLocation = stringWithoutRecommended.includes(
              SMART_LOCATION_STRING
            );
            const firstClosingBracketIndex =
              stringWithoutRecommended.indexOf(')');
            const containClosingBracket = firstClosingBracketIndex !== -1;
            const containsCountry =
              countryIsSmartLocation ||
              (containClosingBracket &&
                firstClosingBracketIndex + 1 !==
                  stringWithoutRecommended.length);
            const countryString = countryIsSmartLocation
              ? SMART_LOCATION_STRING
              : !countryIsSmartLocation && containsCountry
              ? stringWithoutRecommended.substring(
                  0,
                  firstClosingBracketIndex + 1
                )
              : lastCountry;

            if (!countryIsSmartLocation && containsCountry) {
              lastCountry = countryString;
            }

            const cleanLocationString = countryIsSmartLocation
              ? stringWithoutRecommended
                  .replace(SMART_LOCATION_STRING, '')
                  .trim()
              : !countryIsSmartLocation && containsCountry
              ? stringWithoutRecommended.replace(countryString, '').trim()
              : stringWithoutRecommended;

            const countryStringOpeningBracketIndex = countryString.indexOf('(');
            const countryStringClosingBracketIndex = countryString.indexOf(')');
            const countryCode = countryString
              .substring(
                countryStringOpeningBracketIndex + 1,
                countryStringClosingBracketIndex
              )
              .toLocaleLowerCase()
              .trim();

            return {
              alias,
              country: countryString,
              countryCode,
              location: cleanLocationString,
              recommended,
            };
          });
        return mappedLocations;
      }),
      tap((locations) => console.log('locations', locations)),
      catchError(() => of([]))
    );
  }
}
