import { test as base } from "@playwright/test";
import { PageObjectModel } from "./page-object-model";

type Gherkin = {
    Given: (strings: TemplateStringsArray, ...args: any[]) => Promise<void>;
    When: (strings: TemplateStringsArray, ...args: any[]) => Promise<void>;
    Then: (strings: TemplateStringsArray, ...args: any[]) => Promise<void>;
    And: (strings: TemplateStringsArray, ...args: any[]) => Promise<void>;
    But: (strings: TemplateStringsArray, ...args: any[]) => Promise<void>;
  };
  

export type usePOM = {
    container: {
        POM: PageObjectModel
    }
};

function getString(strings: TemplateStringsArray, args: string[], specific: boolean = false) {
    let toFind = '';
    const t = Math.max(strings.length, args.length);
    for(let i = 0; i <= t; i++) {
      if (strings.length > i) {
        toFind += '' + strings[i];
      }
      if (args.length > i) {
        toFind += specific ? args[i] : `p${i}`;
      }
    }
    return toFind;
  }
  
function findMethod(POM: PageObjectModel, name: string):Function {

    let func: any = undefined;
    if (POM.given && name.startsWith('Given')) {
        func = POM.given[name.split(' ').slice(1).join(' ')];
    }
    if (func === undefined && POM.when && name.startsWith('When')) {
        func = POM.when[name.split(' ').slice(1).join(' ')];
    }
    if (func === undefined && POM.then && (name.startsWith('Then') || name.startsWith('And'))) {
        func = POM.then[name.split(' ').slice(1).join(' ')];
    }
    if (func === undefined) {
        func = POM.actions[name.split(' ').slice(1).join(' ')];
    }

    if (!func) {
        console.error(`unable to find method for: '${name}' on Page Object Model`);
        throw `unable to find method for: '${name}' on Page Object Model`;
    }

    return func;
}

export const test = base.extend<Gherkin & usePOM>({
    container: [ { POM: {actions: [], storyline: [], completeStory: () => {} }}, { option: true }],
    Given: async ({ container }, use) => {
      await use(async (strings: TemplateStringsArray, ...args: string[]) => {
        const func = findMethod(container.POM, 'Given' + getString(strings, args));
        await func(...args);
        container.POM.storyline.push('Given' + getString(strings, args, true));
      });
    },
    When: async ({ container }, use) => {
      await use(async (strings: TemplateStringsArray, ...args: string[]) => {
        const func = findMethod(container.POM, 'When' + getString(strings, args));
        await func(...args);
        container.POM.storyline.push('When' + getString(strings, args, true));
      });
    },
    And: async ({ container }, use) => {
      await use(async (strings: TemplateStringsArray, ...args: string[]) => {
        const func = findMethod(container.POM, 'When' + getString(strings, args));
        await func(...args);
        container.POM.storyline.push('And' + getString(strings, args, true));
      });
    },
    Then: async ({ container }, use) => {
      await use(async (strings: TemplateStringsArray, ...args: string[]) => {
        const func = findMethod(container.POM, 'Then' + getString(strings, args));
        await func(...args);
        container.POM.storyline.push('Then' + getString(strings, args, true));
      });
    },
    But: async ({ container }, use) => {
      await use(async (strings: TemplateStringsArray, ...args: string[]) => {
        const func = findMethod(container.POM, 'Then' + getString(strings, args));
        await func(...args);
        container.POM.storyline.push('But' + getString(strings, args, true));
      });
    }
  });
  
  test.afterEach(async ({ container }) => {
    if (container && container.POM) {
      container.POM.completeStory();
    }
  });
  
  export const Scenario = test;
  export const Example = test;

  /**
 * Feature
 * @function a set of tests that cover a specific feature.
 */
export const Feature = (title: string, callback: () => void) => {
    test.describe('@feature ' + title, callback);
  };
  
  /**
   * SmokeTest
   * @function a set of tests to perform a quick and fast check
   */
  export const SmokeTest = (title: string, callback: () => void) => {
    test.describe('@smoke ' + title, callback);
  };
  
  /**
   * Flow
   * @function a set of tests that cover a user flow
   */
  export const Flow = (title: string, callback: () => void) => {
    test.describe('@flow ' + title, callback);
  };
  
  /**
   * CI
   * @function a set of tests that run within the CI pipeline
   */
  export const CI = (title: string, callback: () => void) => {
    test.describe('@ci ' + title, callback);
  };
  