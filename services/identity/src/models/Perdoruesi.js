const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const Perdoruesi = sequelize.define('Perdoruesi', {
        perdoruesi_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emri: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        adresa: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        nr_telefonit: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        fjalekalimi: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        qyteti_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'perdoruesi',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (perdoruesi) => {
                if (perdoruesi.fjalekalimi) {
                    perdoruesi.fjalekalimi = await bcrypt.hash(perdoruesi.fjalekalimi, 12);
                }
            },
            beforeUpdate: async (perdoruesi) => {
                if (perdoruesi.changed('fjalekalimi')) {
                    perdoruesi.fjalekalimi = await bcrypt.hash(perdoruesi.fjalekalimi, 12);
                }
            }
        }
    });

    // Instance method to check password
    Perdoruesi.prototype.validPassword = async function (password) {
        return bcrypt.compare(password, this.fjalekalimi);
    };

    // Remove password from JSON output
    Perdoruesi.prototype.toJSON = function () {
        const values = { ...this.get() };
        delete values.fjalekalimi;
        return values;
    };

    return Perdoruesi;
};
