
class client
{
    constructor(client_id, name, person_count, created_at)
    {
        this.client_id = client_id;
        this.name = name;
        this.person_count = person_count;
        this.created_at = created_at;
    }

    static FromObject(obj)
    {
        return Object.assign(new client(), obj);
    }

    Sanitize()
    {
        let cpyThis = Object.assign({}, this);
        return cpyThis;
    }
}

module.exports = client;
