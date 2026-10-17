import test from 'node:test'; import assert from 'node:assert/strict'; import {normalizeDomain,matchesDomain,makeQuestions,currentStreak} from '../shared/core.js';
test('normalizes a hostname',()=>assert.equal(normalizeDomain(' HTTPS://Shop.Example.COM/path '),'shop.example.com'));
test('rejects malformed hostnames',()=>assert.throws(()=>normalizeDomain('not a domain')));
test('matches exact domains and subdomains only',()=>{assert.ok(matchesDomain('example.com','example.com'));assert.ok(matchesDomain('shop.example.com','example.com'));assert.ok(!matchesDomain('notexample.com','example.com'))});
test('questions have exactly five numeric answers',()=>{for(const d of ['easy','normal','hard']){const q=makeQuestions(d);assert.equal(q.length,5);q.forEach(x=>assert.equal(typeof x.answer,'number'))}});
test('counts consecutive active days as a streak',()=>{const now=Date.now(),day=86400000;assert.equal(currentStreak([{type:'intervention',at:now},{type:'challenge-complete',at:now-day}]),2)});
