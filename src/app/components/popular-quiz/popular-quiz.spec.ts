import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularQuiz } from './popular-quiz.component';

describe('PopularQuiz', () => {
  let component: PopularQuiz;
  let fixture: ComponentFixture<PopularQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
