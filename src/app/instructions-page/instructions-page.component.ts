import { Component, OnInit } from '@angular/core';
import Accordion from 'accordion-js';

@Component({
  templateUrl: './instructions-page.component.html',
  styleUrls: ['./instructions-page.component.scss']
})
export class InstructionsPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const accordions = Array.from(document.querySelectorAll('.accordion-container'));
    new Accordion(accordions, {});
  }

}
