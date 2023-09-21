
async function parseInput(app, input)
{
    input = input.replace(/(\r\n|\n|\r)/gm, " ");

    const numberRegExp = new RegExp('^[0-9]+$');
    const parsedInputs = input.split(" ");

    parsedInputs.pop(); // to get rid of the last " "

    let skipValue = 0;
    let commands  = [];

    let noArgCommands  = ["center", "penup", "pendown"];
    let oneArgCommands = ["forward", "backward", "turnright", "turnleft", "direction", "gox", "goy", "penwidth"];

    var output        = document.querySelector("#txtOutput");
    let outputChanged = false;

    for (let i = 0; i < parsedInputs.length; i++)
    {
        switch(parsedInputs[i])
        {
            case "fd":
                parsedInputs[i] = "forward";
                break;
            case "bd":
                parsedInputs[i] = "backward";
                break;
            case "lt":
                parsedInputs[i] = "turnleft";
                break;
            case "rt":
                parsedInputs[i] = "turnright";
                break;
            case "dir":
                parsedInputs[i] = "direction";
                break;
            case "ct":
                parsedInputs[i] = "center";
                break;
            case "pu":
                parsedInputs[i] = "penup";
                break;
            case "pd":
                parsedInputs[i] = "pendown";
                break;
            case "pw":
                parsedInputs[i] = "penwidth";
                break;
            case "pc":
                parsedInputs[i] = "pencolor";
                break;
        }

        if(skipValue > 0) // we can skip a token if we have read it in the previous step
        {
            skipValue--;
            continue;
        }

        if(oneArgCommands.includes(parsedInputs[i]))
        {
            if ((i+1) >= parsedInputs.length)
            {
                if (outputChanged == false)
                {
                    output.innerHTML = "Value for " + parsedInputs[i] + " is not provided.";
                    outputChanged    = true;
                }
            }
            else if (parsedInputs[i+1].match(numberRegExp))
            {
                if(parsedInputs[i] == "direction" && parsedInputs[i+1] > 360)
                {
                    if (outputChanged == false)
                    {
                        output.innerHTML = parsedInputs[i+1] + " is an invalid input. Value must be between 0 and 360.";
                        outputChanged    = true;
                    }
                }
                else
                {
                    commands.push({type: parsedInputs[i], amount: parsedInputs[i+1]});
                }
                skipValue = 1;
            }
            else
            {
                if (outputChanged == false)
                {
                    output.innerHTML = parsedInputs[i+1] + " is an invalid input.";
                    outputChanged    = true;
                }
            } 
        }
        else if(parsedInputs[i] == "goxy")
        {
            if ((i+2) >= parsedInputs.length)
            {
                if (outputChanged == false)
                {
                    output.innerHTML = "Values for " + parsedInputs[i] + " are not provided.";
                    outputChanged    = true;
                }
            }
            else if (parsedInputs[i+1].match(numberRegExp) &&
                     parsedInputs[i+2].match(numberRegExp))
            {
                commands.push({type: parsedInputs[i], x: parsedInputs[i+1], y: parsedInputs[i+2]});

                skipValue = 2;
            }
            else
            {
                if (outputChanged == false)
                {
                    output.innerHTML = parsedInputs[i+1] + " or " + parsedInputs[i+2] + " is an invalid input.";
                    outputChanged    = true;
                }
            } 
        }
        else if(parsedInputs[i] == "pencolor")
        {
            if ((i+3) >= parsedInputs.length)
            {
                if (outputChanged == false)
                {
                    output.innerHTML = "Values for " + parsedInputs[i] + " are not provided.";
                    outputChanged    = true;
                }
            }
            else if (parsedInputs[i+1].match(numberRegExp) &&
                     parsedInputs[i+2].match(numberRegExp) &&
                     parsedInputs[i+3].match(numberRegExp))
            {
                if(parseInt(parsedInputs[i+1]) >= 0   &&
                   parseInt(parsedInputs[i+1]) <= 255 &&
                   parseInt(parsedInputs[i+2]) >= 0   &&
                   parseInt(parsedInputs[i+2]) <= 255 &&
                   parseInt(parsedInputs[i+3]) >= 0   &&
                   parseInt(parsedInputs[i+3]) <= 255)
                {
                    commands.push({type: parsedInputs[i], r: parsedInputs[i+1], g: parsedInputs[i+2], b: parsedInputs[i+3]});
                    skipValue = 3;
                }
                else
                {
                    skipValue = 3;

                    if (outputChanged == false)
                    {
                        output.innerHTML = "Values for pen width must be between 0 and 255.";
                        outputChanged    = true;
                    }
                }
            }
            else
            {
                if (outputChanged == false)
                {
                    output.innerHTML = parsedInputs[i+1] + " or " + parsedInputs[i+2] + " or " + parsedInputs[i+3] + " is an invalid input.";
                    outputChanged    = true;
                }
            } 
        }
        else if(noArgCommands.includes(parsedInputs[i]))
        {
            commands.push({type: parsedInputs[i], r: parsedInputs[i+1], g: parsedInputs[i+2], b: parsedInputs[i+3]});
        }
        else
        {
            if (outputChanged == false)
            {
                output.innerHTML = parsedInputs[i] + " is an invalid input.";
                outputChanged    = true;
            }
        }
    };

    for (let command of commands)
    {
        if(app.animated == true)
        {
            await app.executeCommand(command);
        }
        else
        {
            app.executeCommand(command);
        }
    };
}
export { parseInput }