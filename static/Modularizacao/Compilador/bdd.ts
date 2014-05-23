﻿
export interface BDD_TestRunner {
    invoke(title: string, func: () => void);
    error(msg: string[], file: string, line: number): void;
    fail(msg: string[], file: string, line: number): void;
    inconclusive(msg: string[], file: string, line: number): void;
    loadSpec(module_name: string, callback: (lines: string[]) => void): void;
    summary(testCount: number): void;
}

export class BDD_Espeficicacao {
    title: string;
    module_name: string;
    events: BDD_Espeficicacao_Evento[] = [];
    func: () => void;
}

export class BDD_Espeficicacao_Evento {
    conditions: string[] = [];
    ensures: string[] = [];

    conditions_funcs: Array<() => void> = [];
    ensures_funcs: Array<() => void> = [];
}

var all_spec: BDD_Espeficicacao[] = [];
var declaring_spec: BDD_Espeficicacao;
var reseting_topic: boolean = false;

export function specification(title: string, declaration: () => void): void {
    try {
        declaring_spec = new BDD_Espeficicacao();
        all_spec.push(declaring_spec);
        declaring_spec.title = title;
        declaring_spec.module_name = module.id;
        declaring_spec.func = declaration;
    }
    finally {
        declaring_spec = null;
    }
}

export function when(title: string, declaration: () => void): BDD_When_Declaration {
    if (reseting_topic)
        return new BDD_When_Declaration();
    if (declaring_spec == null)
        testRunner.fail(["when fora de uma espeficicação"], declaring_spec.module_name, 0);
    var w = new BDD_When_Declaration();
    w.evento = new BDD_Espeficicacao_Evento();
    w.evento.conditions.push(title);
    w.evento.conditions_funcs.push(declaration);
    declaring_spec.events.push(w.evento);
    return w;
}

export class BDD_When_Declaration {
    evento: BDD_Espeficicacao_Evento;
    then(title: string, declaration: () => void): BDD_Then_Declaration {
        if (reseting_topic)
            return new BDD_Then_Declaration();
        this.evento.ensures.push(title);
        this.evento.ensures_funcs.push(declaration);
        var t = new BDD_Then_Declaration();
        t.evento = this.evento;
        return t;
    }
    and(title: string, declaration: () => void): BDD_Then_Declaration {
        if (reseting_topic)
            return new BDD_When_Declaration();
        this.evento.conditions.push(title);
        this.evento.conditions_funcs.push(declaration);
        return this;
    }
}

export class BDD_Then_Declaration {
    evento: BDD_Espeficicacao_Evento;
    and(title: string, declaration: () => void): BDD_Then_Declaration {
        if (reseting_topic)
            return new BDD_Then_Declaration();
        this.evento.ensures.push(title);
        this.evento.ensures_funcs.push(declaration);
        return this;
    }
}

export function expects(value: any): BDD_Expects {
    return new BDD_Expects(value);
}

export class BDD_Expects {
    constructor(public value: any) {
    }

    equals(expectedValue: any) {
        if (this.value != expectedValue)
            testRunner.fail(['esperado  ="' + new String(expectedValue) + '"', 'encontrado="' + new String(this.value) + '"'], specFilename, specRow);
    }
}

var testRunner: BDD_TestRunner;
var specFilename: string;
var specRow: number;
var testCount: number = 0;

export function RunTest(runner: BDD_TestRunner, moduleName: string) {
    testRunner = runner;

    specFilename = moduleName + '.spec';
    specRow = 0;
    var specFile: string[];

    runner.loadSpec(specFilename, function (lines: string[]) {
        specFile = lines;
        q_require(moduleName, function (t: any) {
            try {
                for (var i = 0; i < all_spec.length; i++) {
                    var spec = all_spec[i];
                    test_specification(spec)
                }
            }
            catch (e) {
                if (e !== 'abort')
                    throw e;
            }
            finally {
                runner.summary(testCount);
            }
        });
    });

    function invoke_spec(expected_line: string, func: () => void): void {
        do {
            if (specRow >= specFile.length) {
                runner.error(['Diferença entre especificação e a implementação do teste', 'Espeficicação: -', 'Implementação: ' + expected_line], specFilename, specRow);
                throw 'abort';
            }
            var line = specFile[specRow].trim();
            specRow++;
            var repete = (line == '') || (line.substr(0, 1) == '#');
        } while (repete);
        if (line != expected_line) {
            runner.error(['Diferença entre especificação e a implementação do teste', 'Espeficicação: ' + line, 'Implementação: ' + expected_line], specFilename, specRow);
            throw 'abort';
        }
        runner.invoke(line, func);
    }

    function test_specification(spec: BDD_Espeficicacao) {
        var topic = null;

        function prepare_topic() {
            var topic_ok = false;
            testRunner.invoke(null, () => {
                topic = Object.create(spec.func.prototype);
                try {
                    if (!reseting_topic)
                        declaring_spec = spec;
                    topic.constructor();
                    topic_ok = true;
                }
                catch (e) {
                    testRunner.error(['Erro na implementação da especificação'], specFilename, specRow);
                    throw e;
                }
                finally {
                    declaring_spec = null;
                }
            });
        }

        invoke_spec("Especificação: " + spec.title, () => {
            var first = true;
            reseting_topic = false;
            prepare_topic();
            for (var i = 0; i < spec.events.length; i++) {
                if (first)
                    first = false;
                else {
                    reseting_topic = true;
                    prepare_topic();
                }
                var event = spec.events[i];
                for (var j = 0; j < event.conditions.length; j++)
                    invoke_spec(event.conditions[j], event.conditions_funcs[j]);
                for (var k = 0; k < event.ensures.length; k++)
                    invoke_spec(event.ensures[k], event.ensures_funcs[k]);
            }
        });
    }
}
