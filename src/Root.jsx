import React, { useEffect, useState } from 'react';
import T from '@wojtekmaj/react-t';
import { getMatchingLocale } from '@wojtekmaj/react-t/src/utils';

import Options from './Options';
import DiagramWithLegend from './DiagramWithLegend';
import Footer from './Footer';

import { supportedReactVersions } from './propTypes';

import { supportedLocales } from './i18n/i18n';
import DarkTheme from 'react-dark-theme'
/**
 * Workaround for Google Chrome bug that causes grid to jump when hovered
 * after each rerender. Seems like Chrome can't figure out proper sizes until
 * we give it width explicitly.
 */
function fixChromeGridSizingBug(ref) {
  if (!ref) { return; }
  requestAnimationFrame(() => {
    /* eslint-disable no-param-reassign */
    ref.style.width = `${ref.clientWidth}px`;
    requestAnimationFrame(() => {
      ref.style.width = null;
    });
  });
}

function getLocalStorage(key, defaultValue) {
  return (
    key in localStorage
      ? localStorage[key]
      : defaultValue
  );
}

const rtlLanguages = [
  'ar',
  'fa',
];

function setLocaleToDocument(locale) {
  const localeWithDefault = supportedLocales.includes(locale) ? locale : 'en-US';
  document.documentElement.setAttribute('lang', localeWithDefault);
  const [languageCode] = localeWithDefault.split('-');
  document.documentElement.setAttribute('dir', rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr');
}

const userLocale = getLocalStorage('locale', getMatchingLocale(supportedLocales));
const latestReactVersion = supportedReactVersions[supportedReactVersions.length - 1];
setLocaleToDocument(userLocale);

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(getLocalStorage(key, defaultValue));

  useEffect(() => {
    try {
      localStorage[key] = value;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to safe settings.');
    }
  }, [value]);

  return [value, setValue];
}

function useLocalStorageFlag(key, defaultValue) {
  const [value, setValue] = useLocalStorage(key, defaultValue);
  const valueBoolean = typeof value === 'boolean' ? value : value === 'true';
  function onChange(valueOrFunction) {
    setValue(typeof valueOrFunction === 'function'
      ? valueOrFunction(valueBoolean)
      : valueOrFunction);
  }
  return [valueBoolean, onChange];
}

/**
 * light and dark theme variable
 */
const lightTheme = {
  background: 'white',
  text: 'black',
  render: 'rgb(217, 232, 253)',
  preCommit: 'rgb(255, 242, 205)',
  commit: 'rgb(214, 231, 213)'
}

const darkTheme = {
  background: '#24292E',
  text: 'white',
  render: '#24292E',
  preCommit: '#24292E',
  commit: '#24292E'
}

export default function Root() {
  const [advanced, setAdvanced] = useLocalStorageFlag('showAdvanced', false);
  const [locale, setLocale] = useLocalStorage('locale', userLocale);
  const [reactVersion, setReactVersion] = useLocalStorage('reactVersion', latestReactVersion);

  function toggleAdvanced() {
    setAdvanced(prevAdvanced => !prevAdvanced);
  }

  function toggleLocale(event) {
    const { value } = event.target;
    setLocale(value);
  }

  function toggleReactVersion(event) {
    const { value } = event.target;
    setReactVersion(value);
  }

  useEffect(() => {
    setLocaleToDocument(locale);
  }, [locale]);

  return (
    <div ref={fixChromeGridSizingBug}>
      <DarkTheme light={lightTheme} dark={darkTheme} />
      <h1>
        <T>
          React lifecycle methods diagram
        </T>
      </h1>
      <Options
        advanced={advanced}
        locale={locale}
        reactVersion={reactVersion}
        toggleAdvanced={toggleAdvanced}
        toggleLocale={toggleLocale}
        toggleReactVersion={toggleReactVersion}
      />
      <DiagramWithLegend advanced={advanced} reactVersion={reactVersion} />
      <Footer />
    </div>
  );
}
