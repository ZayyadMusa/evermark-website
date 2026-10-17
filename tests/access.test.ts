import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createLocalJWKSet,exportJWK,generateKeyPair,SignJWT} from 'jose';
import {verifyAccessToken,identityRequest} from '../lib/access-auth.ts';

test('workspace identity requires a valid signature, issuer, audience and expiry',async()=>{
  const {privateKey,publicKey}=await generateKeyPair('RS256');
  const jwk=await exportJWK(publicKey);jwk.kid='unit-key';jwk.alg='RS256';
  const keys=createLocalJWKSet({keys:[jwk]});
  const make=(issuer='https://unit-team.cloudflareaccess.com',audience='workspace',expiration='5m')=>new SignJWT({email:'member@example.com'}).setProtectedHeader({alg:'RS256',kid:'unit-key'}).setSubject('member-1').setIssuedAt().setIssuer(issuer).setAudience(audience).setExpirationTime(expiration).sign(privateKey);
  const valid=await make();
  assert.deepEqual(await verifyAccessToken(valid,'unit-team.cloudflareaccess.com','workspace',keys),{id:'member-1',email:'member@example.com'});
  assert.equal(await verifyAccessToken(await make('https://other.cloudflareaccess.com'),'unit-team.cloudflareaccess.com','workspace',keys),null);
  assert.equal(await verifyAccessToken(await make(undefined,'another-app'),'unit-team.cloudflareaccess.com','workspace',keys),null);
  assert.equal(await verifyAccessToken(await make(undefined,undefined,'-1m'),'unit-team.cloudflareaccess.com','workspace',keys),null);
  assert.equal(await verifyAccessToken(valid+'broken','unit-team.cloudflareaccess.com','workspace',keys),null);
  assert.equal(await verifyAccessToken(valid,'attacker.example','workspace',keys),null);
  assert.equal(await verifyAccessToken(valid,'unit-team.cloudflareaccess.com','',keys),null);
});

test('unverified callers cannot supply a workspace identity header',()=>{
  const forged=new Request('https://evermark.example/api/workspace',{headers:{'x-evermark-user-id':'another-user'}});
  assert.equal(identityRequest(forged,null).headers.get('x-evermark-user-id'),null);
  assert.equal(identityRequest(forged,{id:'verified-user',email:'verified@example.com'}).headers.get('x-evermark-user-id'),'verified-user');
});
