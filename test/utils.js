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

module.exports = {
    assert: Object.assign({}, assert, {
        // eventEqual: assertEventEqual,
        // eventsEqual: assertEventsEqual,
        // bnEqual: assertBNEqual,
        // bnNotEqual: assertBNNotEqual,
        // bnClose: assertBNClose,
        // bnGte: assertBNGreaterEqualThan,
        // bnLte: assertBNLessEqualThan,
        // bnLt: assertBNLessThan,
        // bnGt: assertBNGreaterThan,
        // deepEqual: assertDeepEqual,
        // etherEqual: assertUnitEqual,
        // etherNotEqual: assertUnitNotEqual,
        // invalidOpcode: assertInvalidOpcode,
        // unitEqual: assertUnitEqual,
        // unitNotEqual: assertUnitNotEqual,
        revert: assertRevert,
    })
}