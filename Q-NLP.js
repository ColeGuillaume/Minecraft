// Minecraft Psychologist
// Cole, Micah, Quinn

var natural = require('natural');
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;

var YES_NO_FLAG;
var STEMMER_SCORE;

// TODO
// Create 2 lists, each length 5. One list for random responses to postive stemmer, another for negative.
// Create 1 list of yes/no questions that are physology related, length 20. we pick random 5.
// Create ending remarks of using global VAR Stemmer Score

// Get Name
var tokenizer = new natural.WordTokenizer();
var x = tokenizer.tokenize("Bob");
if (x.length == 1) { console.log(`Nice to meet you ${ x }.`)}
else {
    console.log('Give me your first name, and only your first name please.')
}

// If more then one Sentence
tokenizer = new natural.SentenceTokenizerNew();
var x = tokenizer.tokenize("This is a sentence. This is another sentence");
if (!x.legnth == 1) { console.log('One sentence at a time. I do the talking, I am your psychologist!'); }

// If Question Mark
var tokenizer = new natural.WordPunctTokenizer();
var x = tokenizer.tokenize("i have a question mark?");
if (x[x.length - 1] == '?') { console.log('I ask the questions, not you. I am your pyschologist!'); }

// If no period
var tokenizer = new natural.WordPunctTokenizer();
var x = tokenizer.tokenize("this is an inncorrect setence");
if (x[x.length - 1] != '.') { console.log('Please use correct punctuation with me. I am your pyschologist!'); }

// Yes and No Questions
var analyzer = new Analyzer("English", stemmer, "afinn");
console.log(analyzer.getSentiment(["yes"]));

// Logic
// first things first, get the name of the person, only take one word answer else, ask again
// then use name in sentences

// then 
// if 1 < sentences, print('i do the talking')
// if question mark, print('i do the asking questions')
// if it does not end with a '.' then do, print('talk to me with proper grammer, jeeze!')
// if yes/no question and not a yes/no answer print('please answer yes/no')
    // record yes and no, add to overall stemmer score for how they are doing
// if statement,
// analyze good vs bad respond with random array of postive/negative remarks
// 
// then once you hit end, tell the person the weather as say how it should cheer them up / or
// give them opportunity to cheer someone else up, something stupid