import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let app: HTMLElement;
  
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

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.nativeElement;
    component = fixture.componentInstance;
  })

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render navbar', () => {
    fixture.detectChanges();
    const pagesLinks = app.querySelectorAll(".pages > a") as any;
    [...pagesLinks].forEach(a => {
      const destination = capitalise(a.href);
      expect(destination).toEqual(a.innerHTML);
    });
  });
});

function capitalise(string: string) {
  return string.charAt(0).toUpperCase() + string.split("").splice(1).join("");
}
