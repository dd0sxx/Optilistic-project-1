const { assert } = require('chai')

const assertRevert = async (blockOrPromise, reason) => {
    let errorCaught = false;
    try {
        const result = typeof blockOrPromise === 'function' ? blockOrPromise() : blockOrPromise;
        await result;
    } catch (error) {
        assert.include(error.message, 'revert');
        if (reason) {
            assert.include(error.message, reason);
        }
        errorCaught = true;
    }

    assert.strictEqual(errorCaught, true, 'Operation did not revert as expected');
};

const assertBNEqual = (actualBN, expectedBN, context) => {
    assert.strictEqual(actualBN.toString(), expectedBN.toString(), context);
};

const assertBNNotEqual = (actualBN, expectedBN) => {
    assert.notStrictEqual(actualBN.toString(), expectedBN.toString(), context);
};

const assertBNGreaterThan = (aBN, bBN) => {
    assert.ok(aBN.gt(bBN), `${aBN.toString()} is not greater than ${bBN.toString()}`);
};

const assertBNGreaterEqualThan = (aBN, bBN) => {
    assert.ok(aBN.gte(bBN), `${aBN.toString()} is not greater than or equal to ${bBN.toString()}`);
};

const assertBNLessThan = (aBN, bBN) => {
    assert.ok(aBN.lt(bBN), `${aBN.toString()} is not less than ${bBN.toString()}`);
};

const assertBNLessEqualThan = (aBN, bBN) => {
    assert.ok(aBN.lte(bBN), `${aBN.toString()} is not less than or equal to ${bBN.toString()}`);
};

const assertBNClose = (actualBN, expectedBN, varianceParam = '10') => {
    const actual = BN.isBN(actualBN) ? actualBN : new BN(actualBN);
    const expected = BN.isBN(expectedBN) ? expectedBN : new BN(expectedBN);
    const variance = BN.isBN(varianceParam) ? varianceParam : new BN(varianceParam);
    const actualDelta = expected.sub(actual).abs();

    assert.ok(
        actual.gte(expected.sub(variance)),
        `Number is too small to be close (Delta between actual and expected is ${actualDelta.toString()}, but variance was only ${variance.toString()}`
    );
    assert.ok(
        actual.lte(expected.add(variance)),
        `Number is too large to be close (Delta between actual and expected is ${actualDelta.toString()}, but variance was only ${variance.toString()})`
    );
};

module.exports = {
    assert: Object.assign({}, assert, {
        // eventEqual: assertEventEqual,
        // eventsEqual: assertEventsEqual,
        bnEqual: assertBNEqual,
        bnNotEqual: assertBNNotEqual,
        bnClose: assertBNClose,
        bnGte: assertBNGreaterEqualThan,
        bnLte: assertBNLessEqualThan,
        bnLt: assertBNLessThan,
        bnGt: assertBNGreaterThan,
        // deepEqual: assertDeepEqual,
        // etherEqual: assertUnitEqual,
        // etherNotEqual: assertUnitNotEqual,
        // invalidOpcode: assertInvalidOpcode,
        // unitEqual: assertUnitEqual,
        // unitNotEqual: assertUnitNotEqual,
        revert: assertRevert,
    })
}