import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationPageComponent } from './animation-page.component';

describe('AnimationPage', () => {
  let component: AnimationPageComponent;
  let fixture: ComponentFixture<AnimationPageComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        AnimationPageComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationPageComponent);
    element = fixture.nativeElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // beforeEach( waitForAsync(() => {
  //   TestBed.configureTestingModule({
  //     imports: [ ],
  //     declarations: [ AnimationPageComponent ],
  //     providers: [  ]
  //   }).compileComponents().then(() => {
  //     fixture = TestBed.createComponent(AnimationPageComponent);
  //     component = fixture.componentInstance;
  //     element = fixture.nativeElement;
  //   });
  // }));

  describe('AnimationPageComponent', () => {
  
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('loadTemplateConfig should load bubble sort', () => {
      component.loadTemplateConfig('bubble sort');
      expect(component.config).toEqual(component.BUBBLE_SORT_TEMPLATE);
    });
  
    it('loadTemplateConfig should load queue', () => {
      component.loadTemplateConfig('queue');
      expect(component.config).toBe(component.QUEUE_TEMPLATE);
    });
  
    // it('loadConfig should load user code', () => {
    //   component.loadConfig('queue');
    //   expect(component.config).toBe(queue);
    // });
  });
  
  
  describe('AnimationPageElement', () => {
    const setUp = () => {
      spyOn(component, "loadTemplateConfig");
      (element.querySelector('#template') as HTMLInputElement).value = "queue";
      (element.querySelector(".confirm-btn") as HTMLButtonElement).click();
      fixture.detectChanges();
    };

    it('clicking confirm when queue is selected should call loadTemplateConfig', () => {
      setUp();
      expect(component.loadTemplateConfig).toHaveBeenCalledWith("queue");
    });
    
    it('clicking confirm when queue is selected should set config', () => {
      setUp();
      component.loadTemplateConfig("queue");
      expect(component.config).toEqual(component.QUEUE_TEMPLATE);
    });
  });  
});
