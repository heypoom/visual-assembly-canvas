use crate::Event;

pub fn split_send_events(events: &mut Vec<Event>) -> (Vec<Event>, Vec<Event>) {
    let mut side_effects = vec![];
    let mut sends = vec![];

    while let Some(event) = events.pop() {
        match event {
            Event::Send { .. } => sends.push(event),
            _ => side_effects.push(event),
        }
    }

    (side_effects, sends)
}
