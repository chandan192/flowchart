import {Component, ElementRef, Input} from '@angular/core';
import {jsPlumb, Surface} from "jsplumbtoolkit";
import {jsPlumbService} from "jsplumbtoolkit-angular";

/**
 * Pan/zoom controls for the demo.
 */

@Component({
  selector:"jsplumb-controls",
  template:`<div class="controls">
              <i class="fa fa-arrows selected-mode" mode="pan" title="Pan Mode" (click)="panMode()"></i>
              <i class="fa fa-pencil" mode="select" title="Select Mode" (click)="selectMode()"></i>
              <i class="fa fa-home" reset title="Zoom To Fit" (click)="zoomToFit()"></i>
          </div>`
})
export class ControlsComponent {

  @Input() surfaceId: string;

  surface:Surface;

  constructor(private el: ElementRef, private $jsplumb:jsPlumbService) { }

  getNativeElement(component:any) {
    return (component.nativeElement || component._nativeElement || component.location.nativeElement).childNodes[0];
  }

  panMode() {
    this.surface.setMode("pan");
  }

  selectMode() {
    this.surface.setMode("select");
  }

  zoomToFit() {
    this.surface.getToolkit().clearSelection();
    this.surface.zoomToFit();
  }

  ngAfterViewInit() {
    this.$jsplumb.getSurface(this.surfaceId, (s:Surface) => {

      this.surface = s;
      this.surface.bind("modeChanged", (mode:String) => {
        let controls = this.getNativeElement(this.el);
        jsPlumb.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
        jsPlumb.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
      });

    });
  }
}

