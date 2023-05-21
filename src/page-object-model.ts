import { test } from "./test";

export class PageObjectModel {
    public actions: any;
  
    public given?: any;
    public when?: any;
    public then?: any;
  
    public storyline: string[] = [];
  
    public completeStory() {
      test.info().annotations.push({ type: 'story', description: this.storyline.join('\n') });
    };
  }