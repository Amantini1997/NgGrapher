import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'GrapherJS'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('GrapherJS');
  });

  it('should render navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const pagesLinks = compiled.querySelectorAll('ul > li > a');
    pagesLinks.forEach(link => 
      expect(link).toContain(capitalise(link.href.split("/").reverse()[0]))
    );
    // expect(.textContent).toContain('GrapherJS app is running!');
    // routerlink="/instructions"
  });
});

function capitalise(string: string) {
  return string.charAt(0).toUpperCase() + string.split("").splice(1).join("");
}
