import { fromEvent, map, debounceTime, filter }  from 'rxjs';
import { parseInput } from "./parser.js";

import { App } from "./app.js"

function main()
{
    const canvas = <HTMLCanvasElement>document.querySelector("#c");

    var gl = canvas.getContext("webgl");

    if (!gl) {
        var output = document.querySelector("#txtOutput");
        output.innerHTML = "Sorry, but there is no webGL here :(.";

        return;
    }

    let app     = new App(gl);
    var txtarea = document.querySelector("#codeTxt");

    app.drawScene();

    fromEvent(txtarea, "keyup")
    .pipe(
        filter((e: KeyboardEvent) => e.key === 'Enter'),
        map((checked:any) => checked.currentTarget.value),
        debounceTime(200)
        )
    .subscribe(checked => parse(app, checked));

    var animationSwitch = document.querySelector<HTMLInputElement>("#flexSwitchCheckDefault");

    fromEvent(animationSwitch, "click")
    .pipe(
        map((x:any) => animationSwitch.checked),
        debounceTime(100)
        )
    .subscribe(x => enableAnimation(app, x));

    var animationSpeed = document.querySelector("#animationSpeed");

    fromEvent(animationSpeed, "click")
    .pipe(
        map((x:any) => x.currentTarget.value),
        debounceTime(100)
        )
    .subscribe(x => app.changeAnimationSpeed(x));
}

main();

function enableAnimation(app:any, checked:any)
{
    var animationSpeed = document.querySelector<HTMLInputElement>("#animationSpeed");

    animationSpeed.disabled = (checked == true) ? false : true;

    app.changeAnimationState(checked);
}

function parse(app:any, x:any,)
{  
    parseInput(app, x);
    document.querySelector<HTMLInputElement>("#codeTxt").value = "";
}
