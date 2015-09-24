/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/


// TODO@api
// Naming: Command, Action, ...

/**
 * The command callback.
 */
export interface CommandCallback {

	/**
		 *
		 */
	<T>(...args: any[]): T | Thenable<T>;
}

/**
 * Namespace for commanding
 */
export namespace commands {

	/**
		 * Registers a command that can be invoked via a keyboard shortcut,
		 * an menu item, an action, or directly.
		 *
		 * @param commandId - The unique identifier of this command
		 * @param callback - The command callback
		 * @param thisArgs - (optional) The this context used when invoking {{callback}}
		 * @return Disposable which unregisters this command on disposal
		 */
	export function registerCommand(commandId: string, callback: CommandCallback, thisArg?: any): Disposable;

	/**
		 * Executes a command
		 *
		 * @param commandId - An identifier of a command
		 * @param ...rest - Parameter passed to the command function
		 * @return
		 */
	export function executeCommand<T>(commandId: string, ...rest: any[]): Thenable<T>;
}

export interface EditorOptions {
	tabSize: number;
	insertSpaces: boolean;
}

export class Document {

	onContentChange: Event<Models.IContentChangedEvent[]>;

	constructor(uri: Uri, lines: string[], eol: string, languageId: string, versionId: number);

	getUri(): Uri;

	isUntitled(): boolean;

	getLanguageId(): string;

	getVersionId(): number;

	getText(): string;

	getTextInRange(range: Range): string;

	getTextOnLine(line: number): string;

	validateRange(range: Range): Range;

	validatePosition(position: Position): Position;

	getLineCount(): number;

	getLineMaxColumn(line: number): number;

	getWordRangeAtPosition(position: Position): Range;
}

export class Position {

	line: number;

	column: number;

	constructor(line: number, column: number);

	isBefore(other: Position): boolean;

	isBeforeOrEqual(other: Position): boolean;
}

export class Range {

	start: Position;

	end: Position;

	constructor(start: Position, end: Position);
	constructor(startLine: number, startColumn: number, endLine: number, endColumn: number);

	contains(positionOrRange: Position | Range): boolean;
	isEmpty(): boolean;
}

export class Selection {

	start: Position;

	end: Position;

	constructor(start: Position, end: Position);

	isReversed(): boolean;
}

export class TextEditor {

	constructor(document: Document, selections: Selection[], options: EditorOptions);

	dispose();

	getDocument(): Document;

	getSelection(): Selection;

	setSelection(value: Position | Range | Selection): Thenable<any>;

	getSelections(): Selection[];

	setSelections(value: Selection[]): Thenable<TextEditor>;

	onSelectionsChange: Event<TextEditor>;

	getOptions(): EditorOptions;

	setOptions(options: EditorOptions): Thenable<TextEditor>;

	onOptionsChange: Event<TextEditor>;

	createEdit(): TextEditorEdit;

	applyEdit(edit: TextEditorEdit): Thenable<boolean>;
}

export interface TextEditorEdit {

	replace(location: Position | Range | Selection, value: string): void;

	insert(location: Position, value: string): void;

	delete(location: Range | Selection): void;

}


// TODO@api, TODO@Joh,Ben
// output channels need to be known upfront (contributes in package.json)
export interface OutputChannel extends Disposable {
	append(value: string): void;
	appendLine(value: string): void;
	clear(): void;
	reveal(): void;
}

export interface ExecutionOptions {
	cwd?: string;
	env?: { [name: string]: any };
}

export namespace shell {

	export function getActiveTextEditor(): TextEditor;

	export const onDidChangeActiveTextEditor: Event<TextEditor>;

	export interface MessageFunction {
		(message: string): Thenable<void>;
		(message: string, ...commands: { title: string; command: string | CommandCallback; }[]): Thenable<void>;
	}

	export const showInformationMessage: MessageFunction;

	export const showWarningMessage: MessageFunction;

	export const showErrorMessage: MessageFunction;

	export function setStatusBarMessage(message: string, hideAfter?: number): Disposable;

	export interface QuickPickOptions {
		/**
		* an optional flag to include the description when filtering the picks
		*/
		matchOnDescription?: boolean;

		/**
		* an optional string to show as place holder in the input box to guide the user what she picks on
		*/
		placeHolder?: string;
	}

	export interface QuickPickItem {
		label: string;
		description: string;
	}

	// TODO@api naming: showQuickOpen, showQuickPanel, showSelectionPanel, showQuickie
	export function showQuickPick(items: string[], options?: QuickPickOptions): Thenable<string>;
	export function showQuickPick<T extends QuickPickItem>(items: T[], options?: QuickPickOptions): Thenable<T>;

	export interface InputBoxOptions {
		/**
		* More context around the input that is being asked for.
		*/
		description?: string;

		/**
		* an optional string to show as place holder in the input box to guide the user what to type
		*/
		placeHolder?: string;
	}

	/**
		 * Opens an input box to ask the user for input.
		 */
	export function showInputBox(options?: InputBoxOptions): Thenable<string>;

	export function getOutputChannel(name: string): OutputChannel;

	// TODO@api
	// Justification: Should this be part of the API? Is there a node module that can do the same?
	export function runInTerminal(command: string, args: string[], options?: ExecutionOptions): Thenable<any>;

}

export interface FileSystemWatcher extends Disposable {
	onDidCreate: Event<Uri>;
	onDidChange: Event<Uri>;
	onDidDelete: Event<Uri>;
}

// TODO@api in the future there might be multiple opened folder in VSCode
// so that we shouldn't make broken assumptions here
export namespace workspace {

	export function createFileSystemWatcher(globPattern: string, ignoreCreateEvents?: boolean, ignoreChangeEvents?: boolean, ignoreDeleteEvents?: boolean): FileSystemWatcher;

	// TODO@api - justify this being here
	export function getPath(): string;

	export function getRelativePath(pathOrUri: string | Uri): string;

	// TODO@api - justify this being here
	export function findFiles(include: string, exclude: string, maxResults?: number): Thenable<Uri[]>;

	/**
		 * save all dirty files
		 */
	export function saveAll(includeUntitled?: boolean): Thenable<boolean>;

	/**
		 * are there any dirty files
		 */
	export function anyDirty(): Thenable<boolean>;
}

export namespace languages {

	interface LanguageFilter {
		language: string;
		scheme?: string;
		pattern?: string;
	}

	type LanguageSelector = string | LanguageFilter | Uri | (string | LanguageFilter | Uri)[];

	export interface LanguageStatusFunction {
		(language: LanguageSelector, message: string | { octicon: string; message: string; }, command: string | CommandCallback): Disposable
	}

	export const addInformationLanguageStatus: LanguageStatusFunction;
	export const addWarningLanguageStatus: LanguageStatusFunction;
	export const addErrorLanguageStatus: LanguageStatusFunction;
}

interface Memento {
	// createChild(key: string): Memento;
	getValue<T>(key: string, defaultValue?: T): Thenable<T>;
	setValue(key: string, value: any): Thenable<void>;
}

export namespace plugins {
	export function getStateObject(pluginId: string, global?: boolean): Memento;
}

declare class Uri {

	constructor();
	static parse(path: string): Uri;
	static file(path: string): Uri;
	static create(path: string): Uri;

	/**
		 * scheme is the 'http' part of 'http://www.msft.com/some/path?query#fragment'.
		 * The part before the first colon.
		 */
	scheme: string;


	/**
		 * authority is the 'www.msft.com' part of 'http://www.msft.com/some/path?query#fragment'.
		 * The part between the first double slashes and the next slash.
		 */
	authority: string;


	/**
		 * path is the '/some/path' part of 'http://www.msft.com/some/path?query#fragment'.
		 */
	path: string;

	/**
		 * query is the 'query' part of 'http://www.msft.com/some/path?query#fragment'.
		 */
	query: string;

	/**
		 * fragment is the 'fragment' part of 'http://www.msft.com/some/path?query#fragment'.
		 */
	fragment: string;

	withScheme(value: string): Uri;
	withAuthority(value: string): Uri;
	withPath(value: string): Uri;
	withQuery(value: string): Uri;
	withFragment(value: string): Uri;
	with(scheme: string, authority: string, path: string, query: string, fragment: string): Uri;

	/**
		 * Retuns a string representing the corresponding file system path of this URI.
		 * Will handle UNC paths and normalize windows drive letters to lower-case. Also
		 * uses the platform specific path separator. Will *not* validate the path for
		 * invalid characters and semantics. Will *not* look at the scheme of this URI.
		 */
	fsPath: string;

	/**
		 * Returns a canonical representation of this URI. The representation and normalization
		 * of a URI depends on the scheme.
		 */
	toString(): string;

	toJSON(): any;
}

interface CancellationToken {
	isCancellationRequested: boolean;
	onCancellationRequested: Event<any>;
}

declare class Disposable {
	static of(...disposables: Disposable[]): Disposable;
	static from(...disposableLikes: { dispose: () => void }[]): Disposable;
	constructor(callOnDispose: Function);
	dispose(): any;
}

/**
 * Represents a typed event.
 */
interface Event<T> {

	/**
		 *
		 * @param listener The listener function will be call when the event happens.
		 * @param thisArgs The 'this' which will be used when calling the event listener.
		 * @param disposables An array to which a {{IDisposable}} will be added. The
		 * @return
		 */
	(listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}

/**
 * A range in the editor. This interface is suitable for serialization.
 */
interface IRange {
	/**
		 * Line number on which the range starts (starts at 1).
		 */
	startLineNumber: number;
	/**
		 * Column on which the range starts in line `startLineNumber` (starts at 1).
		 */
	startColumn: number;
	/**
		 * Line number on which the range ends.
		 */
	endLineNumber: number;
	/**
		 * Column on which the range ends in line `endLineNumber`.
		 */
	endColumn: number;
}

export interface IHTMLContentElement {
	formattedText?: string;
	text?: string;
	className?: string;
	style?: string;
	customStyle?: any;
	tagName?: string;
	children?: IHTMLContentElement[];
	isText?: boolean;
}

declare module Services {
	enum Severity {
		Ignore = 0,
		Info = 1,
		Warning = 2,
		Error = 3
	}

	module Severity {
		export function fromValue(value: string): Severity;
	}

	export interface IModelService {
		onDidAddDocument: Event<Document>;
		onDidRemoveDocument: Event<Document>;
		getDocuments(): Document[];
		getDocument(resource: Uri): Document;
	}

	// --- Begin MarkerService
	export interface IMarkerData {
		code?: string;
		severity: Severity;
		message: string;
		startLineNumber: number;
		startColumn: number;
		endLineNumber: number;
		endColumn: number;
	}

	export interface IResourceMarker {
		resource: Uri;
		marker: IMarkerData;
	}

	export interface IMarker {
		owner: string;
		resource: Uri;
		severity: Severity;
		code?: string;
		message: string;
		startLineNumber: number;
		startColumn: number;
		endLineNumber: number;
		endColumn: number;
	}

	export interface IMarkerService {

		changeOne(owner: string, resource: Uri, markers: IMarkerData[]): void;

		changeAll(owner: string, data: IResourceMarker[]): void;

		remove(owner: string, resources: Uri[]): void
	}

	// --- End IMarkerService

	// --- Begin IConfigurationService

	export interface IConfigurationService {
		loadConfiguration(section?: string): Thenable<any>;
	}

	// --- End IConfigurationService


	export var MarkerService: IMarkerService;

	export var ModelService: IModelService;

	export var ConfigurationService: IConfigurationService;
}

declare module Models {
	/**
		 * A single edit operation, that acts as a simple replace.
		 * i.e. Replace text at `range` with `text` in model.
		 */
	export interface ISingleEditOperation {
		/**
		 * The range to replace. This can be empty to emulate a simple insert.
		 */
		range: IRange;
		/**
		 * The text to replace with. This can be null to emulate a simple delete.
		 */
		text: string;
	}

	/**
		 * End of line character preference.
		 */
	export enum EndOfLinePreference {
		/**
		 * Use the end of line character identified in the text buffer.
		 */
		TextDefined = 0,
		/**
		 * Use line feed (\n) as the end of line character.
		 */
		LF = 1,
		/**
		 * Use carriage return and line feed (\r\n) as the end of line character.
		 */
		CRLF = 2
	}

	/**
		 * An event describing a change in the text of a model.
		 */
	export interface IContentChangedEvent {
		/**
		 * The range that got replaced.
		 */
		range: IRange;
		/**
		 * The length of the range that got replaced.
		 */
		rangeLength: number;
		/**
		 * The new text for the range.
		 */
		text: string;
		/**
		 * The new version id the model has transitioned to.
		 */
		versionId: number;
		/**
		 * Flag that indicates that this event was generated while undoing.
		 */
		isUndoing: boolean;
		/**
		 * Flag that indicates that this event was generated while redoing.
		 */
		isRedoing: boolean;
	}
}

// --- Begin Monaco.Modes
declare module Modes {
	interface ILanguage {
		// required
		name: string;								// unique name to identify the language
		tokenizer: Object;							// map from string to ILanguageRule[]

		// optional
		displayName?: string;						// nice display name
		ignoreCase?: boolean;							// is the language case insensitive?
		lineComment?: string;						// used to insert/delete line comments in the editor
		blockCommentStart?: string;					// used to insert/delete block comments in the editor
		blockCommentEnd?: string;
		defaultToken?: string;						// if no match in the tokenizer assign this token class (default 'source')
		brackets?: ILanguageBracket[];				// for example [['{','}','delimiter.curly']]

		// advanced
		start?: string;								// start symbol in the tokenizer (by default the first entry is used)
		tokenPostfix?: string;						// attach this to every token class (by default '.' + name)
		autoClosingPairs?: string[][];				// for example [['"','"']]
		wordDefinition?: RegExp;					// word definition regular expression
		outdentTriggers?: string;					// characters that could potentially cause outdentation
		enhancedBrackets?: Modes.IRegexBracketPair[];// Advanced auto completion, auto indenting, and bracket matching
	}

	/**
		 * This interface can be shortened as an array, ie. ['{','}','delimiter.curly']
		 */
	interface ILanguageBracket {
		open: string;	// open bracket
		close: string;	// closeing bracket
		token: string;	// token class
	}

	interface ILanguageAutoComplete {
		triggers: string;				// characters that trigger auto completion rules
		match: string | RegExp;			// autocomplete if this matches
		complete: string;				// complete with this string
	}

	interface ILanguageAutoIndent {
		match: string | RegExp; 			// auto indent if this matches on enter
		matchAfter: string | RegExp;		// and auto-outdent if this matches on the next line
	}

	/**
		 * Standard brackets used for auto indentation
		 */
	export interface IBracketPair {
		tokenType: string;
		open: string;
		close: string;
		isElectric: boolean;
	}

	/**
		 * Regular expression based brackets. These are always electric.
		 */
	export interface IRegexBracketPair {
		openTrigger?: string; // The character that will trigger the evaluation of 'open'.
		open: RegExp; // The definition of when an opening brace is detected. This regex is matched against the entire line upto, and including the last typed character (the trigger character).
		closeComplete?: string; // How to complete a matching open brace. Matches from 'open' will be expanded, e.g. '</$1>'
		matchCase?: boolean; // If set to true, the case of the string captured in 'open' will be detected an applied also to 'closeComplete'.
		// This is useful for cases like BEGIN/END or begin/end where the opening and closing phrases are unrelated.
		// For identical phrases, use the $1 replacement syntax above directly in closeComplete, as it will
		// include the proper casing from the captured string in 'open'.
		// Upper/Lower/Camel cases are detected. Camel case dection uses only the first two characters and assumes
		// that 'closeComplete' contains wors separated by spaces (e.g. 'End Loop')

		closeTrigger?: string; // The character that will trigger the evaluation of 'close'.
		close?: RegExp; // The definition of when a closing brace is detected. This regex is matched against the entire line upto, and including the last typed character (the trigger character).
		tokenType?: string; // The type of the token. Matches from 'open' or 'close' will be expanded, e.g. 'keyword.$1'.
		// Only used to auto-(un)indent a closing bracket.
	}

	/**
		 * Definition of documentation comments (e.g. Javadoc/JSdoc)
		 */
	export interface IDocComment {
		scope: string; // What tokens should be used to detect a doc comment (e.g. 'comment.documentation').
		open: string; // The string that starts a doc comment (e.g. '/**')
		lineStart: string; // The string that appears at the start of each line, except the first and last (e.g. ' * ').
		close?: string; // The string that appears on the last line and closes the doc comment (e.g. ' */').
	}

	// --- Begin InplaceReplaceSupport
	/**
		 * Interface used to navigate with a value-set.
		 */
	interface IInplaceReplaceSupport {
		sets: string[][];
	}
	var InplaceReplaceSupport: {
		register(modeId: string, inplaceReplaceSupport: Modes.IInplaceReplaceSupport): void;
	};
	// --- End InplaceReplaceSupport


	// --- Begin TokenizationSupport
	enum Bracket {
		None = 0,
		Open = 1,
		Close = -1
	}
	// --- End TokenizationSupport

	// --- Begin IDeclarationSupport
	export interface IDeclarationSupport {
		tokens?: string[];
		findDeclaration(document: Document, position: Position, token: CancellationToken): Thenable<IReference>;
	}
	var DeclarationSupport: {
		register(modeId: string, declarationSupport: IDeclarationSupport): void;
	};
	// --- End IDeclarationSupport

	// --- Begin ICodeLensSupport
	export interface ICodeLensSupport {
		findCodeLensSymbols(document: Document, token: CancellationToken): Thenable<ICodeLensSymbol[]>;
		findCodeLensReferences(document: Document, requests: ICodeLensSymbolRequest[], token: CancellationToken): Thenable<ICodeLensReferences>;
	}
	export interface ICodeLensSymbolRequest {
		position: Position;
		languageModeStateId?: number;
	}
	export interface ICodeLensSymbol {
		range: Range;
	}
	export interface ICodeLensReferences {
		references: IReference[][];
		languageModeStateId?: number;
	}
	var CodeLensSupport: {
		register(modeId: string, codeLensSupport: ICodeLensSupport): void;
	};
	// --- End ICodeLensSupport

	// --- Begin IOccurrencesSupport
	export interface IOccurrence {
		kind?: string;
		range: Range;
	}
	export interface IOccurrencesSupport {
		findOccurrences(resource: Document, position: Position, token: CancellationToken): Thenable<IOccurrence[]>;
	}
	var OccurrencesSupport: {
		register(modeId: string, occurrencesSupport: IOccurrencesSupport): void;
	};
	// --- End IOccurrencesSupport

	// --- Begin IOutlineSupport
	export interface IOutlineEntry {
		label: string;
		type: string;
		icon?: string; // icon class or null to use the default images based on the type
		range: Range;
		children?: IOutlineEntry[];
	}
	export interface IOutlineSupport {
		getOutline(document: Document, token: CancellationToken): Thenable<IOutlineEntry[]>;
		outlineGroupLabel?: { [name: string]: string; };
	}
	var OutlineSupport: {
		register(modeId: string, outlineSupport: IOutlineSupport): void;
	};
	// --- End IOutlineSupport

	// --- Begin IOutlineSupport
	export interface IQuickFix {
		label: string;
		id: any;
		score: number;
		documentation?: string;
	}

	export interface IQuickFixResult {
		edits: IResourceEdit[];
	}

	export interface IQuickFixSupport {
		getQuickFixes(resource: Document, marker: Services.IMarker | Range, token: CancellationToken): Thenable<IQuickFix[]>;
		runQuickFixAction(resource: Document, range: Range, id: any, token: CancellationToken): Thenable<IQuickFixResult>;
	}
	var QuickFixSupport: {
		register(modeId: string, quickFixSupport: IQuickFixSupport): void
	};
	// --- End IOutlineSupport

	// --- Begin IReferenceSupport
	export interface IReferenceSupport {
		tokens?: string[];

		/**
		 * @returns a list of reference of the symbol at the position in the
		 * 	given resource.
		 */
		findReferences(document: Document, position: Position, includeDeclaration: boolean, token: CancellationToken): Thenable<IReference[]>;
	}
	var ReferenceSupport: {
		register(modeId: string, quickFixSupport: IReferenceSupport): void;
	};
	// --- End IReferenceSupport

	// --- Begin IParameterHintsSupport
	export interface IParameter {
		label: string;
		documentation?: string;
		signatureLabelOffset?: number;
		signatureLabelEnd?: number;
	}

	export interface ISignature {
		label: string;
		documentation?: string;
		parameters: IParameter[];
	}

	export interface IParameterHints {
		currentSignature: number;
		currentParameter: number;
		signatures: ISignature[];
	}

	export interface IParameterHintsSupport {
		/**
		 * On which characters presses should parameter hints be potentially shown.
		 */
		triggerCharacters: string[];

		/**
		 * A list of token types that prevent the parameter hints from being shown (e.g. comment, string)
		 */
		excludeTokens: string[];
		/**
		 * @returns the parameter hints for the specified position in the file.
		 */
		getParameterHints(document: Document, position: Position, token: CancellationToken): Thenable<IParameterHints>;
	}
	var ParameterHintsSupport: {
		register(modeId: string, parameterHintsSupport: IParameterHintsSupport): void;
	};
	// --- End IParameterHintsSupport

	// --- Begin IExtraInfoSupport
	export interface IComputeExtraInfoResult {
		range: Range;
		value?: string;
		htmlContent?: IHTMLContentElement[];
		className?: string;
	}
	export interface IExtraInfoSupport {
		computeInfo(document: Document, position: Position, token: CancellationToken): Thenable<IComputeExtraInfoResult>;
	}
	var ExtraInfoSupport: {
		register(modeId: string, extraInfoSupport: IExtraInfoSupport): void;
	};
	// --- End IExtraInfoSupport

	// --- Begin IRenameSupport
	export interface IRenameResult {
		currentName: string;
		edits: IResourceEdit[];
		rejectReason?: string;
	}
	export interface IRenameSupport {
		filter?: string[];
		rename(document: Document, position: Position, newName: string, token: CancellationToken): Thenable<IRenameResult>;
	}
	var RenameSupport: {
		register(modeId: string, renameSupport: IRenameSupport): void;
	};
	// --- End IRenameSupport

	// --- Begin IFormattingSupport
	/**
		 * Interface used to format a model
		 */
	export interface IFormattingOptions {
		tabSize: number;
		insertSpaces: boolean;
	}
	/**
		 * Supports to format source code. There are three levels
		 * on which formatting can be offered:
		 * (1) format a document
		 * (2) format a selectin
		 * (3) format on keystroke
		 */
	export interface IFormattingSupport {
		formatDocument: (document: Document, options: IFormattingOptions, token: CancellationToken) => Thenable<Models.ISingleEditOperation[]>;
		formatRange?: (document: Document, range: Range, options: IFormattingOptions, token: CancellationToken) => Thenable<Models.ISingleEditOperation[]>;
		autoFormatTriggerCharacters?: string[];
		formatAfterKeystroke?: (document: Document, position: Position, ch: string, options: IFormattingOptions, token: CancellationToken) => Thenable<Models.ISingleEditOperation[]>;
	}
	var FormattingSupport: {
		register(modeId: string, formattingSupport: IFormattingSupport): void;
	};
	// --- End IRenameSupport

	// --- Begin ISuggestSupport
	export interface ISortingTypeAndSeparator {
		type: string;
		partSeparator?: string;
	}
	export interface IHighlight {
		start: number;
		end: number;
	}
	export interface ISuggestion {
		label: string;
		codeSnippet: string;
		type: string;
		highlights?: IHighlight[];
		typeLabel?: string;
		documentationLabel?: string;
	}
	export interface ISuggestions {
		currentWord: string;
		suggestions: ISuggestion[];
		incomplete?: boolean;
		overwriteBefore?: number;
		overwriteAfter?: number;
	}
	export interface ISuggestSupport {
		triggerCharacters: string[];
		excludeTokens: string[];

		sortBy?: ISortingTypeAndSeparator[];

		suggest: (document: Document, position: Position, token: CancellationToken) => Thenable<ISuggestions[]>;
		getSuggestionDetails?: (document: Document, position: Position, suggestion: ISuggestion, token: CancellationToken) => Thenable<ISuggestion>;
	}
	var SuggestSupport: {
		register(modeId: string, suggestSupport: ISuggestSupport): void;
	};
	// --- End ISuggestSupport

	// --- Start INavigateTypesSupport

	export interface ITypeBearing {
		containerName: string;
		name: string;
		parameters: string;
		type: string;
		range: Range;
		resourceUri: Uri;
	}

	export interface INavigateTypesSupport {
		getNavigateToItems: (search: string, token: CancellationToken) => Thenable<ITypeBearing[]>;
	}
	var NavigateTypesSupport: {
		register(modeId: string, navigateTypeSupport: INavigateTypesSupport): void;
	};

	// --- End INavigateTypesSupport

	// --- Begin ICommentsSupport
	export interface ICommentsSupport {
		commentsConfiguration: ICommentsConfiguration;
	}
	export interface ICommentsConfiguration {
		lineCommentTokens?: string[];
		blockCommentStartToken?: string;
		blockCommentEndToken?: string;
	}
	var CommentsSupport: {
		register(modeId: string, commentsSupport: ICommentsSupport): void;
	};
	// --- End ICommentsSupport

	// --- Begin ITokenTypeClassificationSupport
	export interface ITokenTypeClassificationSupport {
		wordDefinition?: RegExp;
	}
	var TokenTypeClassificationSupport: {
		register(modeId: string, tokenTypeClassificationSupport: ITokenTypeClassificationSupport): void;
	};
	// --- End ITokenTypeClassificationSupport

	// --- Begin IElectricCharacterSupport
	export interface IElectricCharacterSupport {
		brackets: IBracketPair[];
		regexBrackets?: IRegexBracketPair[];
		docComment?: IDocComment;
		caseInsensitive?: boolean;
		embeddedElectricCharacters?: string[];
	}
	var ElectricCharacterSupport: {
		register(modeId: string, electricCharacterSupport: IElectricCharacterSupport): void;
	};
	// --- End IElectricCharacterSupport

	// --- Begin ICharacterPairSupport
	export interface ICharacterPairSupport {
		autoClosingPairs: IAutoClosingPairConditional[];
		surroundingPairs?: IAutoClosingPair[];
	}
	/**
		 * Interface used to support insertion of matching characters like brackets and qoutes.
		 */
	export interface IAutoClosingPair {
		open: string;
		close: string;
	}
	export interface IAutoClosingPairConditional extends IAutoClosingPair {
		notIn?: string[];
	}
	var CharacterPairSupport: {
		register(modeId: string, characterPairSupport: ICharacterPairSupport): void;
	};
	// --- End ICharacterPairSupport

	// --- Begin IOnEnterSupport
	export interface IBracketPair2 {
		open: string;
		close: string;
	}
	export interface IIndentationRules {
		decreaseIndentPattern: RegExp;
		increaseIndentPattern: RegExp;
		indentNextLinePattern?: RegExp;
		unIndentedLinePattern?: RegExp;
	}
	export enum IndentAction {
		None,
		Indent,
		IndentOutdent,
		Outdent
	}
	export interface IEnterAction {
		indentAction: IndentAction;
		appendText?: string;
		removeText?: number;
	}
	export interface IOnEnterRegExpRules {
		beforeText: RegExp;
		afterText?: RegExp;
		action: IEnterAction;
	}
	export interface IOnEnterSupportOptions {
		brackets?: IBracketPair2[];
		indentationRules?: IIndentationRules;
		regExpRules?: IOnEnterRegExpRules[];
	}
	var OnEnterSupport: {
		register(modeId: string, opts: IOnEnterSupportOptions): void;
	};
	// --- End IOnEnterSupport

	export interface IResourceEdit {
		resource: Uri;
		range?: Range;
		newText: string;
	}

	export interface IReference {
		resource: Uri;
		range: Range;
	}

	interface IMode {
		getId(): string;
	}

	function registerMonarchDefinition(modeId: string, language: Modes.ILanguage): void;
	function loadInBackgroundWorker<T>(scriptSrc: string): Thenable<T>;

}

declare module Plugins {
	function get(pluginId: string): any;
}

/**
 * DO NOT USE.
 */
export namespace _internal {

	/**
		 * DO NOT USE.
		 */
	export function sendTelemetryEvent(event: string, data: any): void;
}

/**
 * Thenable is a common denominator between ES6 promises, Q, jquery.Deferred, WinJS.Promise,
 * and others. This API makes no assumption about what promise libary is being used which
 * enables reusing existing code without migrating to a specific promise implementation. Still,
 * we recommand the use of native promises which are available in VS Code.
 */
interface Thenable<R> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: R) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: R) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
}

// ---- ES6 promise ------------------------------------------------------

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> extends Thenable<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Promise<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Promise<TResult>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch(onrejected?: (reason: any) => T | Thenable<T>): Promise<T>;

    // [Symbol.toStringTag]: string;
}

interface PromiseConstructor {
    // /**
    //   * A reference to the prototype.
    //   */
    // prototype: Promise<any>;

    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <T>(executor: (resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    all<T>(values: Array<T | Thenable<T>>): Promise<T[]>;

    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    race<T>(values: Array<T | Thenable<T>>): Promise<T>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject(reason: any): Promise<void>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T>(reason: any): Promise<T>;

    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    resolve<T>(value: T | Thenable<T>): Promise<T>;

    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    resolve(): Promise<void>;

    // [Symbol.species]: Function;
}

declare var Promise: PromiseConstructor;