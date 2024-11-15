var Vec3 = require('vec3');
const {
    RaycastIterator
} = require('prismarine-world').iterators;

function startAutoclicker(bot, options) {
    bot.autoclicker = { running: false };

    bot.autoclicker.options = {
        max_distance: options.max_distance || 5,
        swing_through: options.swing_through || ['experience_orb'],
        blacklist: options.blacklist || ['player'],
        stop_on_window: options.stop_on_window || true,
        always_swing: options.always_swing || true,
        delay: 1500,
    };

    bot.autoclicker.running = true;
    bot.autoclicker.interval = setInterval(async function () {
        if (bot.autoclicker.options.stop_on_window && bot.currentWindow) return;

        let entity = entityAtCursor(bot);

        if (!entity || bot.autoclicker.options.blacklist.includes(entity.name)) {
            return bot.autoclicker.options.always_swing ? bot.swingArm() : null;
        }

        // Здесь добавьте код для удара по сущности
        await bot.attack(entity);
    }, bot.autoclicker.options.delay);
}

function stopAutoclicker(bot) {
    bot.autoclicker.running = false;
    clearInterval(bot.autoclicker.interval);
}

function armorStandAtCursor(bot, maxDistance = 5) {
    const armorStands = Object.values(bot.entities)
        .filter(entity => entity.type === 'armor_stand' && entity.position.distanceTo(bot.entity.position) <= maxDistance);

    return armorStands.length > 0 ? armorStands[0] : null;
}

function entityAtCursor(bot, maxDistance = 5, swing_through = ['experience_orb']) {
    let armorStand = armorStandAtCursor(bot, maxDistance);
    if (armorStand) {
        return armorStand;
    }

    const block = bot.blockAtCursor(maxDistance);
    maxDistance = block?.intersect.distanceTo(bot.entity.position) ?? maxDistance;

    const entities = Object.values(bot.entities)
        .filter(entity => entity.type !== 'object' && entity.username !== bot.username && entity.position.distanceTo(bot.entity.position) <= maxDistance && !swing_through.includes(entity.name));

    const dir = new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.yaw) * Math.cos(bot.entity.pitch));
    const iterator = new RaycastIterator(bot.entity.position.offset(0, bot.entity.height, 0), dir.normalize(), maxDistance);

    let targetEntity = null;
    let targetDist = maxDistance;

    for (let entity of entities) {
        const w = entity.width / 2;
        const shapes = [[-w, 0, -w, w, entity.height + (entity.type === 'player' ? 0.18 : 0), w]];
        const intersect = iterator.intersect(shapes, entity.position);
        if (intersect) {
            const entityDir = entity.position.minus(bot.entity.position);
            const sign = Math.sign(entityDir.dot(dir));
            if (sign !== -1) {
                const dist = bot.entity.position.distanceTo(intersect.pos);
                if (dist < targetDist) {
                    targetEntity = entity;
                    targetDist = dist;
                }
            }
        }
    }

    return targetEntity;
}

module.exports = { startAutoclicker, stopAutoclicker };
