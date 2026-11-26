import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
const bank=JSON.parse(readFileSync(new URL('../questions.json',import.meta.url),'utf8'));
const context={window:{}};
runInNewContext(readFileSync(new URL('../questions.js',import.meta.url),'utf8'),context);
assert.equal(JSON.stringify(context.window.OFFICIAL_QUIZZES),JSON.stringify(bank),'generated JS matches JSON');
const expected={A:13,B:20,C:11,D:16,E:14};
const expectedAnswers={
A:['E','B','E','D','A','B','D','B','E','D','B','E','B'],
B:['D','A','A','B','B','B','A','A','C','C','C','C','B','B','B','BD','C','E','D','B'],
C:['B','B','A','A','B','C','A','B','D','A','A'],
D:['D','A','B','A','B','A','B','D','A','C','E','B','B','C','C','D'],
E:['E','B','E','D','A','B','D','B','E','A','E','C','B','E']};
assert.equal(bank.length,74,'total questions');
assert.equal(new Set(bank.map(q=>q.id)).size,74,'unique question IDs');
for(const [part,n] of Object.entries(expected)){
 const qs=bank.filter(q=>q.part===part);
 assert.equal(qs.length,n,`Part ${part} count`);
 qs.forEach((q,i)=>{
  assert.equal(q.id,`${part}-${String(i+1).padStart(2,'0')}`);
  assert.equal(q.number,i+1);
  assert(q.question.length>8,`${q.id} question text`);
  assert.deepEqual(Object.keys(q.options),'ABCDE'.slice(0,Object.keys(q.options).length).split(''));
  assert(Object.values(q.options).every(x=>x.length>0),`${q.id} empty option`);
  assert.equal(q.answers.join(''),expectedAnswers[part][i],`${q.id} official key`);
  assert(q.answers.every(key=>q.options[key]),`${q.id} answer not in options`);
  assert(q.sourcePage>0&&q.answerPage>0,`${q.id} missing citation page`);
  assert(Array.isArray(q.slidePages)&&q.slidePages.length>0,`${q.id} missing relevant slides`);
  assert.equal(new Set(q.slidePages).size,q.slidePages.length,`${q.id} duplicate slide`);
  assert(q.slidePages.every(page=>Number.isInteger(page)&&page>0&&page<=213),`${q.id} invalid slide page`);
 });
}
assert.equal(bank.filter(q=>q.answers.length>1).length,1);
assert.deepEqual(bank.find(q=>q.id==='B-16').answers,['B','D']);
assert.deepEqual(bank.find(q=>q.id==='A-11').slidePages,[49]);
assert.deepEqual(bank.find(q=>q.id==='E-14').slidePages,[209]);
console.log('Validated all 74 source questions and official A–E answers.');
