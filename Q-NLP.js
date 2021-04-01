// Minecraft Psychologist
// Cole, Micah, Quinn
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({ host: 'localhost', port: '50665', username: "FinalBot" });

const natural = require('natural');
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;

let NAME_FLAG = true;
let YES_NO_FLAG = false;
let STEMMER_SCORE = 0;

bot.on('login', () => {
    bot.chat('Hello. I am your physcologist. You may call me Dr.')
    bot.chat('What is your name?');
});

bot.on('playerLeft', (player) => {
    if (player.username === bot.username) return
    bot.chat(`Bye ${player.username}`)
});

bot.on('chat', (username, message) => {
    if (username != bot.username) {
        if (NAME_FLAG) {
            let tokenizer = new natural.WordTokenizer();
            let x = tokenizer.tokenize(message);
            if (x.length == 1) { 
                bot.chat(`Nice to meet you ${ x }.`);
                NAME_FLAG = false;
            }
            else {
                bot.chat('Give me your first name, and only your first name please.');
            }
        }
        // Quiz time!
        if (YES_NO_FLAG) {
            console.log('quiz');
            conductQuiz();
        }
    }
});

function conductQuiz() {
    console.log('quiz');
    // while true of 5 questions
    // pops a question out of an array
    // records answer
    // uses stemmer to add 1 or 2 to STEMMER SCORE
}
// TODO
// Create 2 lists, each length 5. One list for random responses to postive stemmer, another for negative.
// Create 1 list of yes/no questions that are physology related, length 20. we pick random 5.
// Create ending remarks of using global VAR Stemmer Score

// Put it in minecraft!

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
