import { MORE_CARDS } from './more-cards.js';
export const TOPICS = [
  {id:'all',name:'Focus mix',symbol:'✦',description:'Extra attention for language analysis and learning principles.'},
  {id:'grammar',name:'Language analysis',symbol:'Aa',description:'Name the form. Explain its use in context.'},
  {id:'materials',name:'Learning principles',symbol:'◇',description:'Connect activities to how people learn a language.'},
  {id:'pronunciation',name:'Connected speech',symbol:'≈',description:'Identify the feature, the sounds and where they meet.'},
  {id:'terms',name:'Terminology',symbol:'≡',description:'Precise terms, complete definitions and clear examples.'},
  {id:'testing',name:'Test evaluation',symbol:'✓',description:'Turn observations into useful diagnostic evaluation.'},
  {id:'exam',name:'Answer craft',symbol:'↗',description:'Make each point distinct, relevant and supported.'}
];
export const SOURCES = {
  grammar:{label:'Grammar reference',url:'https://dictionary.cambridge.org/grammar/british-grammar/'},
  teaching:{label:'Teaching reference',url:'https://www.teachingenglish.org.uk/professional-development/teachers/teaching-knowledge-database'},
  exam:{label:'Examiner guidance · 2015',url:'https://www.cambridgeenglish.org/images/22081-delta-module-one-exam-report-june-2015.pdf'},
  terms:{label:'DELTA handbook',url:'https://www.cambridgeenglish.org/es/images/181161-delta-handbook-for-tutors-and-candidates-document.pdf'}
};
// Original prompts and examples; not reproduced past-paper questions.
export const CARDS = [
  ...MORE_CARDS,
  {id:'m01',topic:'materials',kind:'Spot the difference',q:'Which is an assumption about language learning?',example:'A. Learners have visited a museum.\nB. Familiar contexts can make new language easier to understand.',answer:'B — a principle about how learning happens.',explain:'A describes learners’ background. B links a design choice (a familiar context) to a possible learning benefit. Support a learning principle with evidence from a specified exercise and a reason.',checks:['Choose B and explain the difference.','Connect a design choice to a learning benefit.'],trap:'A plausible fact about the learners is not automatically a principle of learning.',source:'teaching'},
  {id:'g01',topic:'grammar',kind:'Analyse the form',q:'Name the tense and explain the time relationship.',example:'When the lesson began, Maya had already left.',answer:'Past perfect simple: had + past participle.',explain:'“Had” is the past-tense auxiliary; “left” is the irregular past participle of leave. The leaving happened before a second past event: the beginning of the lesson.',checks:['Past perfect simple.','Had + past participle.','An event before another past event.'],trap:'“Past finished tense” is not a standard tense label. Saying only “in the past” misses the relationship.',source:'grammar'},
  {id:'p01',topic:'pronunciation',kind:'Name the sound change',q:'What may happen to “to” in ordinary, unstressed speech?',example:'We need to leave.',answer:'A weak form: /tə/.',explain:'The vowel in “to” may reduce to schwa /ə/ when unstressed. The exact realization varies with accent and emphasis; the word is not simply removed.',checks:['Name a weak form or vowel reduction.','Give /tə/ and identify schwa /ə/.'],trap:'Fast speech does not mean entire grammatical words disappear.',source:'grammar'},
  {id:'t01',topic:'terms',kind:'Retrieve the term',q:'What do we call brief listener responses that show attention and encourage a speaker to continue?',example:'“Mm-hm.” · “Right.” · “I see.”',answer:'Back-channelling.',explain:'These short responses help maintain the interaction without necessarily taking a full speaking turn.',checks:['Recall the term back-channelling.','Explain the listener’s supportive role.'],trap:'Knowing the idea is not enough in a term-identification task; retrieve the established label.',source:'terms'},
  {id:'v01',topic:'testing',kind:'Evaluate a test',q:'A teacher uses five detail questions on one recording to plan a whole listening course. What is a major limitation?',answer:'The sample is too narrow for a broad diagnosis.',explain:'One recording and one subskill provide little evidence about learners’ wider listening needs. Add varied texts and tasks before deciding what the course should prioritise.',checks:['Identify narrow sampling.','Explain the consequence for course planning.'],trap:'A short test may be convenient, but convenience alone does not make its diagnosis adequate.',source:'teaching'},
  {id:'e01',topic:'exam',kind:'Strengthen an answer',q:'Make this point more useful: “Pairwork is good because students talk more.”',answer:'Add a learning mechanism and a classroom example.',explain:'In a paired information-gap task, both learners need to ask for missing details. This creates more opportunities to retrieve language and ask for clarification, while the teacher listens for recurring difficulties.',checks:['Explain what learners do with language.','Give a specific activity or context.','Show why that process may support learning.'],trap:'Longer is not automatically better. Add a distinct reason, not a paraphrase of the original claim.',source:'teaching'}
];
